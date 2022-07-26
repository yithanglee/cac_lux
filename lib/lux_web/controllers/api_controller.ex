defmodule LuxWeb.ApiController do
  use LuxWeb, :controller
  import Mogrify
  alias Lux.{Settings}

  require Logger

  def webhook_post(conn, params) do
    final =
      case params["scope"] do
        "update_category_children" ->
          %{
            "category" => %{"41" => %{"27" => "", "28" => "", "29" => ""}},
            "scope" => "update_children"
          }

          [parent_key] = params |> Map.get("category") |> Map.keys() |> IO.inspect()

          children_ids =
            params |> Map.get("category") |> Map.get(parent_key) |> Map.keys() |> IO.inspect()

          Settings.update_category_children(parent_key, children_ids)
          %{status: "ok"}

        "scan_image" ->
          image =
            open(params["image"].path)
            |> resize("1200x1200")
            |> save
            |> IO.inspect()

          a =
            File.read!(image.path)
            |> Base.encode64()
            |> IO.inspect()

          Elixir.Task.start_link(Lux, :inspect_image, [a])
          %{status: "ok"}

        "strong_search" ->
          q = params["query"]

          Lux.Settings.strong_search_book_inventory(q)
          |> Enum.map(&(&1 |> BluePotion.s_to_map()))

        "update_member_profile" ->
          {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", params["token"])
          user = Lux.Settings.get_member!(map.id)
          res = Lux.Settings.update_member(user, BluePotion.upload_file(params["Member"]))

          case res do
            {:ok, u} ->
              %{status: "ok"}

            {:error, cg} ->
              IO.inspect(cg)
              %{status: "error"}
          end

        "update_profile" ->
          {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", params["token"])
          user = Lux.Settings.get_user!(map.id)
          res = Lux.Settings.update_user(user, BluePotion.upload_file(params["User"]))

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
        "children_category" ->
          Settings.get_category_children(params["id"])

        "blog" ->
          Settings.get_blog!(params["id"]) |> BluePotion.s_to_map()

        "blogs" ->
          put_ago = fn map ->
            Map.put(map, :ago, map.inserted_at |> Lux.check_time_difference())
          end

          Settings.list_blogs(params["category"])
          |> Enum.map(&(&1 |> BluePotion.s_to_map()))
          |> Enum.map(&(&1 |> put_ago.()))

        "get_token" ->
          # for member only
          m = Lux.Settings.get_member_by_email(params["email"])
          # |> BluePotion.s_to_map() 

          Lux.Settings.member_token(m.id)

        "get_member_profile" ->
          {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", params["token"])

          Lux.Settings.get_member!(map.id)
          |> BluePotion.s_to_map()
          |> Map.delete(:id)
          |> Map.put(:crypted_password, "")

        "get_profile" ->
          case Phoenix.Token.verify(LuxWeb.Endpoint, "signature", params["token"]) do
            {:ok, map} ->
              Lux.Settings.get_user!(map.id)
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
              {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", p["id"])
              Map.put(p, "id", map.id)

            _ ->
              p
          end

        "User" ->
          case p["id"] |> Integer.parse() do
            :error ->
              {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", p["id"])
              Map.put(p, "id", map.id)

            _ ->
              p
          end

        _ ->
          p
      end

    {result, _values} = Code.eval_string(dynamic_code, params: p |> Lux.upload_file())

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
          Lux.Settings.decode_token(parent_id).id
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
          Lux.Settings.decode_token(corporate_account_id).id
        )
      else
        params
      end
  end

  def datatable(conn, params) do
    model = Map.get(params, "model")
    preloads = Map.get(params, "preloads")
    additional_search_queries = Map.get(params, "additional_search_queries")
    params = Map.delete(params, "model") |> Map.delete("preloads")

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
        |> Jason.decode!()
        |> IO.inspect()
        |> Enum.map(&(&1 |> convert_to_atom.()))

        # |> Enum.map(&(&1 |> String.to_atom()))
      end
      |> List.flatten()

    IO.inspect(preloads)

    json =
      BluePotion.post_process_datatable(
        params,
        Module.concat(["Lux", "Settings", model]),
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
