defmodule CacWeb.ApiController do
  use CacWeb, :controller
  import Mogrify
  alias Cac.{Settings}

  require Logger
  @app_secret Application.get_env(:cac, :facebook)[:app_secret]
  @app_id Application.get_env(:cac, :facebook)[:app_id]
  @page_access_token "EAAHu7jvjr2EBAPGJNtq3ZBZAeKk4z3yYz0ymcrZBZAV30eTvWLxIdHHI773apJAgvDmfm8vZC0MjNOJVVQbg3cR91eGM8HcC9H0w0PvAMKWbx17lZARyONS9CGO5jg860mEqMYW7CkGZAWXe39qqapZBHDnc5dcrZCXZCFEZAawrJvl1HeCjeaNtmPSdHnuaSeAZAgZCnXTwhuFNGpwZDZD"

  import FacebookHelper

  def fb_webhook(conn, params) do
    # parameter = Repo.get_by(Settings.Parameter, name: "page_access_token")

    # pat = parameter.cvalue

    challenge = params["hub.challenge"]
    mode = params["hub.mode"]
    token = params["hub.verify_token"]

    if mode != nil and token != nil do
      IO.puts(mode)

      if mode == "subscribe" and token == @page_access_token do
        IO.puts("WEBHOOK_VERIFIED")
        send_resp(conn, 200, challenge)
      else
        send_resp(conn, 500, [])
      end
    else
      send_resp(conn, 500, [])
    end
  end

  def fb_webhook_post(conn, params) do
    IO.inspect(params)

    sample = %{
      "entry" => [
        %{
          "changes" => [
            %{
              "field" => "live_videos",
              "value" => %{"id" => "4444444444", "status" => "live_stopped"}
            }
          ],
          "id" => "0",
          "time" => 1_645_812_508
        }
      ],
      "object" => "page"
    }

    case params["object"] do
      "page" ->
        entry_list = params["entry"]

        for %{"changes" => changes} = item <- entry_list do
          cond do
            changes |> Enum.map(&(&1["field"] == "live_videos")) ->
              IO.inspect(List.first(changes)["value"])
          end
        end

        for %{"messaging" => messaging2} = item <- entry_list do
          %{
            "time" => time,
            "messaging" => messages,
            "id" => fb_page_id
          } = item

          page = Cac.Repo.get_by(Cac.Settings.FacebookPage, page_id: fb_page_id)

          if page != nil do
            set_ps = fn sender_psid ->
              page_visitor =
                Cac.Repo.get_by(Cac.Settings.PageVisitor,
                  facebook_page_id: page.id,
                  psid: sender_psid
                )

              page_visitor =
                if page_visitor == nil do
                  existing_page_commenter =
                    Cac.Repo.get_by(Cac.Settings.PageVisitor,
                      psid: sender_psid
                    )

                  {:ok, p} =
                    if existing_page_commenter == nil do
                      Cac.Settings.create_page_visitor(%{
                        facebook_page_id: page.id,
                        psid: sender_psid
                      })
                    else
                      Cac.Settings.update_page_visitor(existing_page_commenter, %{
                        facebook_page_id: page.id
                      })
                    end

                  p
                else
                  page_visitor
                end
            end

            for %{"message" => content, "sender" => %{"id" => psid}} = message <- messages do
              Logger.info("[FB MESSENGER]: Sender PSID: " <> psid)

              handleMessage(page, set_ps.(psid), content)
            end

            for %{"postback" => postback, "sender" => %{"id" => psid}} = message <- messages do
              Logger.info("[FB MESSENGER]: Sender PSID: " <> psid)

              handlePostback(page, set_ps.(psid), postback)
            end
          end
        end

        send_resp(conn, 200, "EVENT_RECEIVED")

      "user" ->
        entry_list = params["entry"]
        IO.puts(Jason.encode!(entry_list))

        for item <- entry_list do
          fb_user_id = item["uid"]

          if Enum.any?(item["changed_fields"], fn x -> x == "live_videos" end) do
            company_name = params["company_name"]

            # check_user_live_video(fb_user_id, company_name)
          end
        end

        send_resp(conn, 200, "EVENT_RECEIVED")

      _ ->
        send_resp(conn, 500, [])
    end
  end

  def webhook_post(conn, params) do
    final =
      case params["scope"] do
        "cache" ->
          if params["title"] != nil do
            c = Cac.Settings.get_cache_page_by_name(params["title"])
            blog = Cac.Settings.get_blog_by_title(params["title"])

            if c != nil && blog != nil do
              Cac.Settings.update_cache_page(c, %{blog_id: blog.id, content: params["content"]})
            else
              if blog != nil do
                Cac.Settings.create_cache_page(%{
                  title: params["title"],
                  blog_id: blog.id,
                  content: params["content"] |> String.replace("  ", "")
                })
              end
            end
          else
            c = Cac.Settings.get_cache_page_by_blog_id(params["blog_id"])
            blog = Cac.Settings.get_blog!(params["blog_id"])

            if c == nil do
              Cac.Settings.create_cache_page(%{
                title: blog.title,
                blog_id: params["blog_id"],
                content: params["content"]
              })
            else
              Cac.Settings.update_cache_page(c, %{title: blog.title, content: params["content"]})
            end
          end

          %{status: "ok"}

        "google_signin" ->
          sample = %{
            "result" => %{
              "email" => "yithanglee@gmail.com",
              "name" => "damien lee",
              "uid" => "c3x50ZfwgubqWHrqqz5VCkmkwtg2"
            },
            "scope" => "google_signin"
          }

          res = params["result"]

          {:ok, member} = Settings.lazy_get_member(res["email"], res["name"], res["uid"])

          token =
            Phoenix.Token.sign(
              CacWeb.Endpoint,
              "signature",
              BluePotion.s_to_map(member) |> Map.take([:id, :name])
            )

        "delete_user_group" ->
          Settings.get_user_group!(params["id"]) |> Settings.delete_user_group()
          %{status: "ok"}

        "nilify_user_group" ->
          Settings.get_user_group!(params["id"]) |> Settings.nilify_user_group()
          %{status: "ok"}

        "update_user_group" ->
          Settings.get_user_group!(params["id"]) |> Settings.update_user_group(params)
          %{status: "ok"}

        "create_user_group" ->
          Settings.create_user_group(params["user_groups"])
          %{status: "ok"}

        "delete_user_venue" ->
          Settings.delete_user_venue(params)
          %{status: "ok"}

        "create_user_venue" ->
          Settings.create_user_venue(params)
          %{status: "ok"}

        "update_venue_user" ->
          [parent_key] = params |> Map.get("group") |> Map.keys()

          children_ids = params |> Map.get("group") |> Map.get(parent_key) |> Map.keys()

          Settings.assign_venue_user(parent_key, children_ids, params)
          %{status: "ok"}

        "update_group_user" ->
          [parent_key] = params |> Map.get("group") |> Map.keys()

          children_ids = params |> Map.get("group") |> Map.get(parent_key) |> Map.keys()

          Settings.assign_group_user(parent_key, children_ids, params)
          %{status: "ok"}

        "update_event_speaker" ->
          [parent_key] = params |> Map.get("event") |> Map.keys()

          children_ids = params |> Map.get("event") |> Map.get(parent_key) |> Map.keys()

          Settings.assign_event_speaker(parent_key, children_ids)
          %{status: "ok"}

        "update_category_children" ->
          %{
            "category" => %{"41" => %{"27" => "", "28" => "", "29" => ""}},
            "scope" => "update_children"
          }

          [parent_key] = params |> Map.get("category") |> Map.keys()

          children_ids = params |> Map.get("category") |> Map.get(parent_key) |> Map.keys()

          Settings.update_category_children(parent_key, children_ids)
          %{status: "ok"}

        "scan_image" ->
          image =
            open(params["image"].path)
            |> resize("1200x1200")
            |> save

          a =
            File.read!(image.path)
            |> Base.encode64()

          Elixir.Task.start_link(Cac, :inspect_image, [a])
          %{status: "ok"}

        "strong_search" ->
          q = params["query"]

          Cac.Settings.strong_search_book_inventory(q)
          |> Enum.map(&(&1 |> BluePotion.s_to_map()))

        "update_member_profile" ->
          {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", params["token"])
          user = Cac.Settings.get_member!(map.id)
          res = Cac.Settings.update_member(user, BluePotion.upload_file(params["Member"]))

          case res do
            {:ok, u} ->
              %{status: "ok"}

            {:error, cg} ->
              IO.inspect(cg)
              %{status: "error"}
          end

        "update_profile" ->
          {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", params["token"])
          user = Cac.Settings.get_user!(map.id)
          res = Cac.Settings.update_user(user, BluePotion.upload_file(params["User"]))

          case res do
            {:ok, u} ->
              %{status: "ok"}

            {:error, cg} ->
              IO.inspect(cg)
              %{status: "error"}
          end

        _ ->
          %{status: "received"}
      end

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(final))
  end

  def webhook(conn, params) do
    final =
      case params["scope"] do
        "show_fb_page_posts" ->
          FacebookHelper.page_post(params["page_id"], params["page_access_token"])

        "get_existing_fbpages" ->
          map = Cac.Settings.decode_token(params["token"]) |> IO.inspect()

          case map do
            %{id: id} ->
              user = Cac.Settings.get_user!(id)

              Cac.Settings.get_user_by_fb_user_id(user.fb_user_id)
              |> BluePotion.sanitize_struct()
              |> Map.get(:facebook_pages)

            _ ->
              []
          end

        "get_fbpages" ->
          map = Cac.Settings.decode_token(params["token"]) |> IO.inspect()

          case map do
            %{id: id} ->
              user = Cac.Settings.get_user!(id)
              FacebookHelper.get_user_existing_pages(user.fb_user_id)

            _ ->
              []
          end

        "get_directory" ->
          Settings.get_directory()
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "get_venue" ->
          Settings.get_venue!(params["id"])
          |> Cac.Repo.preload([:users, :region])
          |> BluePotion.sanitize_struct()

        "get_group" ->
          Settings.get_group!(params["id"])
          |> Cac.Repo.preload(users: [:venues])
          |> BluePotion.sanitize_struct()

        "related_blogs" ->
          Settings.get_blog_by_keyword(params["keyword"], params)

        "get_region" ->
          Settings.get_region_with_year(params["id"], params["year_id"])

        "get_regions" ->
          regions =
            Settings.list_regions_with_year(params["year_id"])
            |> Enum.group_by(& &1.region)

          rg_keys = Map.keys(regions)

          for rg_key <- rg_keys do
            %{region: rg_key, venues: regions[rg_key]}
          end

        "regions" ->
          Settings.list_regions()
          |> Cac.Repo.preload(venues: [:users])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "list_groups" ->
          Settings.list_groups()
          |> Cac.Repo.preload(users: [:venues])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "groups" ->
          Settings.list_groups_with_service_year(params["service_year_id"])
          # |> Cac.Repo.preload(users: [:venues])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "venue_users" ->
          Settings.get_venue_users(params["id"])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "group_users" ->
          Settings.get_group_users(params["id"])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "event_speakers" ->
          []

        "event" ->
          Settings.get_event!(params["id"])
          |> Cac.Repo.preload([:organizer, :speakers, venue: [:region]])
          |> BluePotion.sanitize_struct()

        "get_events" ->
          Settings.list_events()
          |> Cac.Repo.preload(venue: [:region])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "blog_categories" ->
          Settings.list_categories()
          |> Cac.Repo.preload([:children])
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "departments" ->
          Settings.list_departments()
          |> Enum.map(&(&1 |> BluePotion.s_to_map()))

        # "get_events" ->
        #   eventStart = DateTime.from_unix!(params["start"] |> String.to_integer(), :millisecond)
        #   eventEnd = DateTime.from_unix!(params["end"] |> String.to_integer(), :millisecond)

        #   {eventStart, eventEnd}
        #   %{status: "ok"}

        "children_category" ->
          Settings.get_category_children(params["id"])

        "blog" ->
          Settings.get_blog!(params["id"]) |> BluePotion.s_to_map()

        "blogs" ->
          put_ago = fn map ->
            Map.put(map, :ago, map.inserted_at |> Cac.check_time_difference())
          end

          Settings.list_blogs(params)
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))
          |> Enum.map(&(&1 |> put_ago.()))

        "get_token" ->
          # for member only
          m = Cac.Settings.get_member_by_email(params["email"])
          # |> BluePotion.s_to_map() 

          Cac.Settings.member_token(m.id)

        "get_member_profile" ->
          {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", params["token"])

          Cac.Settings.get_member!(map.id)
          |> BluePotion.s_to_map()
          |> Map.delete(:id)
          |> Map.put(:crypted_password, "")
          |> Map.take([:name, :email, :code, :cname, :image_url])

        "get_profile" ->
          case Phoenix.Token.verify(CacWeb.Endpoint, "signature", params["token"]) do
            {:ok, map} ->
              Cac.Settings.get_user!(map.id)
              |> BluePotion.s_to_map()
              |> Map.delete(:id)
              |> Map.put(:crypted_password, "")

            {:error, _expired} ->
              %{status: "expired"}
          end

        "gen_inputs" ->
          BluePotion.test_module(params["module"])

        _ ->
          %{status: "received"}
      end

    # the admin no nid the cache control

    append_cache_request = fn conn ->
      if conn.req_headers
         |> Enum.into(%{})
         |> Map.get("referer", "")
         |> String.contains?("admin") do
        conn
      else
        conn
        |> put_resp_header("cache-control", "max-age=900, must-revalidate")
      end
    end

    conn
    |> append_cache_request.()
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(final))
  end

  def form_submission(conn, params) do
    model = Map.get(params, "model")
    params = Map.delete(params, "model")

    upcase? = fn x -> x == String.upcase(x) end

    sanitized_model =
      model
      |> String.split("")
      |> Enum.reject(&(&1 == ""))
      |> Enum.map(
        &if upcase?.(&1), do: String.replace(&1, &1, "_#{String.downcase(&1)}"), else: &1
      )
      |> Enum.join("")
      |> String.split("")
      |> Enum.reject(&(&1 == ""))
      |> List.pop_at(0)
      |> elem(1)
      |> Enum.join()

    IO.inspect(params)
    json = %{}
    config = Application.get_env(:blue_potion, :contexts)

    mods =
      if config == nil do
        ["Settings", "Secretary"]
      else
        config
      end

    struct =
      for mod <- mods do
        Module.concat([Application.get_env(:blue_potion, :otp_app), mod, model])
      end
      |> Enum.filter(&Code.ensure_compiled?(&1))
      |> List.first()

    IO.inspect(struct)

    mod =
      struct
      |> Module.split()
      |> Enum.take(2)
      |> Module.concat()

    IO.inspect(mod)

    dynamic_code =
      if Map.get(params, model) |> Map.get("id") != "0" do
        """
        struct = #{mod}.get_#{sanitized_model}!(params["id"])
        #{mod}.update_#{sanitized_model}(struct, params)
        """
      else
        """
        #{mod}.create_#{sanitized_model}(params)
        """
      end

    p = Map.get(params, model)

    p =
      case model do
        "Member" ->
          case p["id"] |> Integer.parse() do
            :error ->
              {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", p["id"])
              Map.put(p, "id", map.id)

            _ ->
              p
          end

        "User" ->
          case p["id"] |> Integer.parse() do
            :error ->
              {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", p["id"])
              Map.put(p, "id", map.id)

            _ ->
              p
          end

        _ ->
          p
      end

    {result, _values} = Code.eval_string(dynamic_code, params: p |> Cac.upload_file())

    IO.inspect(result)

    case result do
      {:ok, item} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(BluePotion.s_to_map(item)))

      {:error, %Ecto.Changeset{} = changeset} ->
        errors = changeset.errors |> Keyword.keys()

        {reason, message} = changeset.errors |> hd()
        {proper_message, message_list} = message
        final_reason = Atom.to_string(reason) <> " " <> proper_message

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Jason.encode!(%{status: final_reason}))
    end
  end

  def append_params(params) do
    parent_id = Map.get(params, "parent_id")

    params =
      if parent_id != nil do
        params
        |> Map.put(
          "parent_id",
          Cac.Settings.decode_token(parent_id).id
        )
      else
        params
      end

    password = Map.get(params, "password")

    params =
      if password != nil do
        crypted_password = :crypto.hash(:sha512, password) |> Base.encode16() |> String.downcase()

        params
        |> Map.put(
          "crypted_password",
          crypted_password
        )
      else
        params
      end

    IO.inspect("appended")
    IO.inspect(params)

    params
  end

  def decode_token(params) do
    corporate_account_id = Map.get(params, "corporate_account_id")

    params =
      if corporate_account_id != nil do
        params
        |> Map.put(
          "corporate_account_id",
          Cac.Settings.decode_token(corporate_account_id).id
        )
      else
        params
      end
  end

  def _datatable(conn, params) do
    model = Map.get(params, "model")
    preloads = Map.get(params, "preloads")
    additional_search_queries = Map.get(params, "additional_search_queries")
    additional_join_statements = Map.get(params, "additional_join_statements") |> IO.inspect()

    params = Map.delete(params, "model") |> Map.delete("preloads")

    additional_join_statements =
      if additional_join_statements == nil do
        ""
      else
        joins = additional_join_statements |> Jason.decode!()

        for join <- joins do
          key = Map.keys(join) |> List.first()
          value = join |> Map.get(key)
          module = Module.concat(["Cac", "Settings", key])

          "|> join(:left, [a], b in #{module}, on: a.#{value} == b.id)"
        end
        |> Enum.join("")
      end
      |> IO.inspect()

    additional_search_queries =
      if additional_search_queries == nil do
        ""
      else
        # replace the data inside
        # its a list [column1, column2]
        columns = additional_search_queries |> String.split(",")

        for {item, index} <- columns |> Enum.with_index() do
          if item |> String.contains?("!=") do
            [i, val] = item |> String.split("!=")

            """
            |> where([a], a.#{i} != "#{val}") 
            """
          else
            ss = params["search"]["value"]

            if index > 0 do
              """
              |> or_where([a], ilike(a.#{item}, ^"%#{ss}%"))
              """
            else
              """
              |> where([a], ilike(a.#{item}, ^"%#{ss}%"))
              """
            end
          end
        end
        |> Enum.join("")
      end

    preloads =
      if preloads == nil do
        preloads = []
      else
        convert_to_atom = fn data ->
          if is_map(data) do
            items = data |> Map.to_list()

            for {x, y} <- items do
              {String.to_atom(x), String.to_atom(y)}
            end
          else
            String.to_atom(data)
          end
        end

        preloads
        |> Jason.decode!()
        |> Enum.map(&(&1 |> convert_to_atom.()))

        # |> Enum.map(&(&1 |> String.to_atom()))
      end
      |> List.flatten()

    IO.inspect(preloads)

    json =
      BluePotion.post_process_datatable(
        params,
        Module.concat(["Cac", "Settings", model]),
        additional_join_statements,
        additional_search_queries,
        preloads
      )

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(json))
  end

  def datatable(conn, params) do
    model = Map.get(params, "model")
    preloads = Map.get(params, "preloads")
    additional_search_queries = Map.get(params, "additional_search_queries")
    additional_join_statements = Map.get(params, "additional_join_statements") |> IO.inspect()
    params = Map.delete(params, "model") |> Map.delete("preloads")

    additional_join_statements =
      if additional_join_statements == nil do
        ""
      else
        joins = additional_join_statements |> Poison.decode!()

        for join <- joins do
          key = Map.keys(join) |> List.first()
          value = join |> Map.get(key)
          # module = Module.concat(["Church", "Settings", key])

          config = Application.get_env(:blue_potion, :contexts)

          mods =
            if config == nil do
              ["Settings", "Secretary"]
            else
              config
            end

          struct =
            for mod <- mods do
              Module.concat([Application.get_env(:blue_potion, :otp_app), mod, key])
            end
            |> IO.inspect()
            |> Enum.filter(&(elem(Code.ensure_compiled(&1), 0) == :module))
            |> IO.inspect()
            |> List.first()

          "|> join(:left, [a], b in assoc(a, :#{key}))"
        end
        |> Enum.join("")
      end
      |> IO.inspect()

    IO.puts("search query")

    additional_search_queries =
      if additional_search_queries == nil do
        ""
      else
        columns = additional_search_queries |> String.split(",")

        for {item, index} <- columns |> Enum.with_index() do
          if item |> String.contains?("!=") do
            [i, val] = item |> String.split("!=")

            """
            |> where([a], a.#{i} != "#{val}") 
            """
          else
            ss = params["search"]["value"]
            items = String.split(item, "|")

            subquery =
              for i <- items do
                if i |> String.contains?(".") do
                  [prefix, i] = i |> String.split(".")
                  # if possible, here need to add back the previous and statements
                  [i, value] =
                    if i |> String.contains?("=") do
                      [i, value] = String.split(i, "=")
                    else
                      [i, ""]
                    end

                  ss =
                    if value != "" do
                      value
                    else
                      ss
                    end

                  unless i |> String.contains?("_id") do
                    """
                    ilike(#{prefix}.#{i}, ^"%#{ss}%")
                    """
                  else
                    case Integer.parse(ss) do
                      {ss, _val} ->
                        """
                        #{prefix}.#{i} == ^#{ss}
                        """

                      _ ->
                        """
                        ilike(a.#{i}, ^"%#{ss}%")
                        """
                    end
                  end
                else
                  [i, value] =
                    if i |> String.contains?("=") do
                      [i, value] = String.split(i, "=")
                    else
                      [i, ""]
                    end

                  ss =
                    if value != "" do
                      value
                    else
                      ss
                    end

                  unless i |> String.contains?("_id") do
                    """
                    ilike(a.#{i}, ^"%#{ss}%")
                    """
                  else
                    case Integer.parse(ss) do
                      {ss, _val} ->
                        """
                        a.#{i} == ^#{ss}
                        """

                      _ ->
                        """
                        ilike(a.#{i}, ^"%#{ss}%")
                        """
                    end
                  end
                end
              end
              |> Enum.join(" and ")

            """
            |> or_where([a,b,c], #{subquery})
            """
          end
        end
        |> Enum.join("")
      end
      |> IO.inspect()

    preloads =
      if preloads == nil do
        preloads = []
      else
        convert_to_atom = fn data ->
          if is_map(data) do
            items = data |> Map.to_list()

            for {x, y} <- items do
              {String.to_atom(x), String.to_atom(y)}
            end
          else
            String.to_atom(data)
          end
        end

        preloads
        |> Poison.decode!()
        |> IO.inspect()
        |> Enum.map(&(&1 |> convert_to_atom.()))

        # |> Enum.map(&(&1 |> String.to_atom()))
      end
      |> List.flatten()

    config = Application.get_env(:blue_potion, :contexts)

    mods =
      if config == nil do
        ["Settings", "Secretary"]
      else
        config
      end

    struct =
      for mod <- mods do
        Module.concat([Application.get_env(:blue_potion, :otp_app), mod, model])
      end
      |> IO.inspect()
      |> Enum.filter(&(elem(Code.ensure_compiled(&1), 0) == :module))
      |> IO.inspect()
      |> List.first()

    IO.inspect(struct)

    json =
      BluePotion.post_process_datatable(
        params,
        struct,
        additional_join_statements,
        additional_search_queries,
        preloads
      )

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(json))
  end

  def delete_data(conn, params) do
    model = Map.get(params, "model")
    params = Map.delete(params, "model")

    upcase? = fn x -> x == String.upcase(x) end

    sanitized_model =
      model
      |> String.split("")
      |> Enum.reject(&(&1 == ""))
      |> Enum.map(
        &if upcase?.(&1), do: String.replace(&1, &1, "_#{String.downcase(&1)}"), else: &1
      )
      |> Enum.join("")
      |> String.split("")
      |> Enum.reject(&(&1 == ""))
      |> List.pop_at(0)
      |> elem(1)
      |> Enum.join()

    IO.inspect(params)
    json = %{}

    config = Application.get_env(:blue_potion, :contexts)

    mods =
      if config == nil do
        ["Settings", "Secretary"]
      else
        config
      end

    struct =
      for mod <- mods do
        Module.concat([Application.get_env(:blue_potion, :otp_app), mod, model])
      end
      |> Enum.filter(&({:error, :nofile} != Code.ensure_compiled(&1)))
      |> List.first()

    IO.inspect(struct)

    mod =
      struct
      |> Module.split()
      |> Enum.take(2)
      |> Module.concat()

    IO.inspect(mod)

    dynamic_code = """
    struct = #{mod}.get_#{sanitized_model}!(params["id"])
    #{mod}.delete_#{sanitized_model}(struct)
    """

    {result, _values} = Code.eval_string(dynamic_code, params: params)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{status: "already deleted"}))
  end
end
