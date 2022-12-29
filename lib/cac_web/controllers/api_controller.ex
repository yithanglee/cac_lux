defmodule CacWeb.ApiController do
  use CacWeb, :controller
  import Mogrify
  alias Cac.{Settings}

  require Logger

  def webhook_post(conn, params) do
    final =
      case params["scope"] do
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
        "get_directory" ->
          Settings.get_directory()
          |> Enum.map(&(&1 |> BluePotion.sanitize_struct()))

        "get_group" ->
          Settings.get_group!(params["id"])
          |> Cac.Repo.preload(users: [:venues])
          |> BluePotion.sanitize_struct()

        "get_region" ->
          Settings.get_region_with_year(params["id"], params["year_id"])

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

    conn
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
