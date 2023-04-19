defmodule Cac do
  @moduledoc """
  Cac keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """
  import Mogrify
  import Ecto.Query
  alias Cac.{Repo, Settings}
  use Hound.Helpers
  require IEx

  def start_chrome() do
    Porcelain.shell("pkill chrome ")
    Porcelain.shell("chromedriver --url-base=/wd/hub ")
  end

  def test_save_page() do
    Task.start_link(__MODULE__, :start_chrome, [])

    Hound.start_session()

    base_url = Application.get_env(:cac, :endpoint)[:url]
    # IEx.pry()
    # blogs = Repo.all(Settings.Blog) |> Enum.take(1)

    # if blogs != [] do
    #   for blog <- blogs do
    #     link = "#{base_url}/blogs/#{blog.id}/#{blog.title}" |> IO.inspect()
    #     # Process.sleep(4000)
    navigate_to(base_url) |> IO.inspect()
    #     path = save_page("screenshot-test.html")

    #     html = File.read!("screenshot-test.html")

    #     # {:ok, document} = Floki.parse_document(html)

    #     # content =
    #     #   document
    #     #   |> Floki.raw_html()

    #     # IO.puts(content)
    #     # a = Repo.get_by(RenderPage, link: "/blogs/#{blog.id}")

    #     # if a == nil do
    #     #   Settings.create_render_page(%{link: "/blogs/#{blog.id}", html: content})
    #     # else
    #     #   Settings.update_render_page(a, %{link: "/blogs/#{blog.id}", html: content})
    #     # end
    #   end
    # else
    #   []
    # end

    # here nid to save all the rendered html
    Hound.end_session()
  end

  def generate_sitemap() do
    # create a filepath for sitemap
    # write into the sitemap
    # xml version 

    base_url = Application.get_env(:cac, :endpoint)[:url]
    blogs = Repo.all(Settings.Blog)

    pages =
      if blogs != [] do
        for blog <- blogs do
          title =
            if blog.title != nil do
              blog.title |> String.replace("<", "") |> String.replace(">", "") |> IO.inspect()
            else
              "blog-#{blog.id}"
            end

          ~s(    
  <url>
    <loc>#{base_url}/blogs/#{blog.id}/#{title}</loc>
    <lastmod>#{blog.updated_at |> NaiveDateTime.to_date() |> Date.to_string()}</lastmod>
  </url>)
        end
      else
        []
      end

    final_pages = pages |> Enum.join("")

    ori = ~s(<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
#{final_pages}
</urlset>)
    path = Application.app_dir(:cac, "priv/static/sitemap.xml")
    File.touch!(path)
    File.write!(path, ori)
  end

  def set_all_current_service_year() do
    query = from(ug in Settings.UserGroup)

    Repo.update_all(query, set: [service_year_id: 1])

    query = from(ug in Settings.UserVenue)

    Repo.update_all(query, set: [service_year_id: 1])
  end

  def wordpress_get(next_link \\ "per_page=10&page=2") do
    url = "http://www.methodist.org.my/wp-json/wp/v2/posts?#{next_link}"

    # Cac.Repo.delete_all(Cac.Settings.Blog)

    case HTTPoison.get(url) |> IO.inspect() do
      {:ok, %{body: body, headers: header} = resp} ->
        link =
          header
          |> Enum.into(%{})
          |> Map.get("Link")
          |> String.split(",")
          |> Enum.filter(&(&1 |> String.contains?("next")))
          |> Enum.map(&(&1 |> String.split(";") |> hd))
          |> Enum.map(&(&1 |> String.split("?") |> tl))
          |> List.flatten()
          |> List.first()
          |> String.replace(">", "")
          |> IO.inspect()

        list = body |> Jason.decode!()

        for post <- list do
          post |> parse_post_body
        end

        Elixir.Task.start_link(__MODULE__, :wordpress_get, [link])

        link

      _ ->
        nil
    end
  end

  def parse_post_body(post) do
    IO.inspect(post)

    meta = %{
      "会友篇" => "",
      "供图" => "",
      "整理" => "",
      "文" => "",
      "牧者篇" => "",
      "资料提供" => "",
      "采访/整理" => ""
    }

    get_content_images = fn tuple ->
      {"img", attr_list, _list} = tuple
      check = File.exists?(File.cwd!() <> "/media")

      path =
        if check do
          File.cwd!() <> "/media"
        else
          File.mkdir(File.cwd!() <> "/media")
          File.cwd!() <> "/media"
        end

      map = Enum.into(attr_list, %{}) |> IO.inspect()
      src = map |> Map.get("src", nil)

      with true <- src != nil,
           true <- src != "" do
        [_head, tail] =
          if src |> String.contains?("https") do
            src |> String.split("https://www.methodist.org.my/wp-content/uploads/")
          else
            src |> String.split("http://www.methodist.org.my/wp-content/uploads/")
          end

        [year, month, image_filename] = tail |> String.split("/")
        fl = tail |> String.replace("/", "_") |> IO.inspect()

        %HTTPoison.Response{body: body} = HTTPoison.get!(src)
        File.mkdir_p(File.cwd!() <> "/media/#{year}/#{month}")
        File.write!("#{path}/#{tail}", body)

        {:ok, sm} =
          Cac.Settings.create_stored_media(%{img_url: "/wp-content/uploads/#{tail}", name: fl})
      else
        _ ->
          nil
      end
    end

    get_content = fn post ->
      a = post |> Map.get("content") |> Map.get("rendered")

      # Floki.parse(a) 

      img_list = Floki.find(a, "img") |> IO.inspect() |> Enum.map(&(&1 |> get_content_images.()))
      a
    end

    get_featured_image = fn post ->
      # todo need to save the image into local machine

      check = File.exists?(File.cwd!() <> "/media")

      path =
        if check do
          File.cwd!() <> "/media"
        else
          File.mkdir(File.cwd!() <> "/media")
          File.cwd!() <> "/media"
        end

      urls = post |> Map.get("featured_image_urls") |> IO.inspect() |> Map.get("1536x1536")

      with true <- urls != "",
           true <- urls != [] do
        url = urls |> hd

        [_head, tail] = url |> String.split("http://www.methodist.org.my/wp-content/uploads/")
        [year, month, image_filename] = tail |> String.split("/")
        fl = tail |> String.replace("/", "_") |> IO.inspect()

        %HTTPoison.Response{body: body} = HTTPoison.get!(url)
        File.mkdir_p(File.cwd!() <> "/media/#{year}/#{month}")
        File.write!("#{path}/#{tail}", body)

        {:ok, sm} =
          Cac.Settings.create_stored_media(%{img_url: "/wp-content/uploads/#{fl}", name: fl})

        "/images/uploads/#{fl}"
      else
        _ ->
          "/images/placeholder.png"
      end
    end

    get_category = fn post ->
      cat = Cac.Settings.get_category_by_name(post |> Map.get("tag_info"))
      cat.id
    end

    get_title = fn post ->
      post |> Map.get("title") |> Map.get("rendered")
    end

    get_date = fn post ->
      NaiveDateTime.from_iso8601!(post |> Map.get("date"))
    end

    attrs = %{
      content: get_content.(post),
      img_url: get_featured_image.(post),
      category_id: get_category.(post),
      title: get_title.(post),
      inserted_at: get_date.(post),
      updated_at: get_date.(post)
    }

    # {:ok, blog} = Cac.Settings.create_blog(attrs) |> IO.inspect()
  end

  def check_time_difference(date_to_check \\ Timex.shift(Timex.now(), hours: -100)) do
    duration = date_to_check |> Timex.diff(Timex.now(), :duration)

    duration
    |> Elixir.Timex.Format.Duration.Formatters.Humanized.format()
    |> String.split(",")
    |> List.first()
  end

  def ensure_gtoken_kv_created() do
    if Process.whereis(:gtoken_kv) == nil do
      {:ok, pid} = Agent.start_link(fn -> %{} end)
      Process.register(pid, :gtoken_kv)

      IO.inspect("gtoken_kv kv created")
    else
      IO.inspect("gtoken_kv kv exist")
    end
  end

  def inspect_image(b64_image) do
    ensure_gtoken_kv_created()
    pid = Process.whereis(:gtoken_kv)

    token = Agent.get(pid, fn map -> map["token"] end)

    headers = [
      {"content-type", "application/json"},
      {"Authorization", "Bearer #{token}"}
    ]

    url = "https://vision.googleapis.com/v1/images:annotate"

    body =
      %{
        requests: [
          %{
            image: %{content: b64_image},
            features: [%{type: "TEXT_DETECTION"}]
          }
        ]
      }
      |> Jason.encode!()

    case HTTPoison.post(url, body, headers) do
      {:ok, resp} ->
        d =
          resp.body
          |> Jason.decode!()
          |> IO.inspect()

        d2 =
          d
          |> Map.get("responses")

        if d2 != nil do
          d3 =
            d2
            |> List.first()
            |> Map.get("fullTextAnnotation")
            |> Map.get("text")

          CacWeb.Endpoint.broadcast("user:lobby", "decoded_image", %{
            data: d3,
            b64_image: b64_image
          })
        else
          token = get_gtoken()
          Agent.update(pid, fn map -> Map.put(map, "token", token) end)
          inspect_image(b64_image)
        end

      {:error, reason} ->
        IO.inspect(reason)

        CacWeb.Endpoint.broadcast("user:lobby", "decoded_image", %{
          data: "",
          b64_image: b64_image
        })
    end
  end

  def get_gtoken() do
    filename = "assetmanagement-lh-724d2fa50035.json"
    path = Application.app_dir(:cac)
    gdata = File.read!("#{path}/priv/static/#{filename}") |> Jason.decode!()

    {:ok, c3} =
      Joken.Signer.sign(
        %{
          iss: gdata["client_email"],
          scope: "https://www.googleapis.com/auth/cloud-vision",
          aud: "https://oauth2.googleapis.com/token",
          exp: DateTime.utc_now() |> Timex.shift(hours: 1) |> DateTime.to_unix(),
          iat: DateTime.utc_now() |> DateTime.to_unix()
        },
        Joken.Signer.parse_config(:rs256)
      )
      |> IO.inspect()

    body =
      "grant_type=#{URI.encode_www_form("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=#{
        c3
      }"

    {:ok, resp} =
      HTTPoison.post("https://oauth2.googleapis.com/token", body, [
        {"content-type", "application/x-www-form-urlencoded"}
      ])

    a = resp.body |> Jason.decode!()
    a["access_token"] |> String.replace("..", "")
  end

  def eval_codes(singular, plural) do
    struct =
      singular |> String.split("_") |> Enum.map(&(&1 |> String.capitalize())) |> Enum.join("")

    dynamic_code =
      """
        alias Cac.Settings.#{struct}
        def list_#{plural}() do
          Repo.all(#{struct})
        end
        def get_#{singular}!(id) do
          Repo.get!(#{struct}, id)
        end
        def create_#{singular}(params \\\\ %{}) do
          #{struct}.changeset(%#{struct}{}, params) |> Repo.insert()
        end
        def update_#{singular}(model, params) do
          #{struct}.changeset(model, params) |> Repo.update()
        end
        def delete_#{singular}(%#{struct}{} = model) do
          Repo.delete(model)
        end

        random_id = makeid(4)
        #{singular}Source = new phoenixModel({
          columns: [
          
            { label: 'id', data: 'id' },
            { label: 'Action', data: 'id' }

          ],
          moduleName: "#{struct}",
          link: "#{struct}",
          customCols: customCols,
          buttons: [{
            buttonType: "grouped",
            name: "Manage",
            color: "outline-warning",
            buttonList: [

              {
                name: "Edit",
                iconName: "fa fa-edit",
                color: "btn-sm btn-outline-warning",
                onClickFunction: editData,
                fnParams: {
                  drawFn: enlargeModal,
                  customCols: customCols
                }
              },
              {
                name: "Delete",
                iconName: "fa fa-trash",
                color: "outline-danger",
                onClickFunction: deleteData,
                fnParams: {}
              }
            ],
            fnParams: {

            }
            }, ],
          tableSelector: "#" + random_id
        })
        #{singular}Source.load(random_id, "#tab1")



          function call#{struct}() {
            #{singular}Source2 = new phoenixModel({
              columns: [{
                  label: 'Name',
                  data: 'name'
                },
                {
                  label: 'Action',
                  data: 'id'
                }
              ],
              moduleName: "#{struct}",
              link: "#{struct}",
              buttons: [{
                name: "Select",
                iconName: "fa fa-check",
                color: "btn-sm btn-outline-success",
                onClickFunction: (params) => {
                  var dt = params.dataSource;
                  var table = dt.table;
                  var data = table.data()[params.index]
                  console.log(data.id)
                  $("input[name='Book[#{singular}][name]']").val(data.name)
                  $("input[name='Book[#{singular}][id]']").val(data.id)
                  $("input[name='Book[#{singular}_id]']").val(data.id)
                  $("#myModal").modal('hide')
                },
                fnParams: {
                 
                }
              }, ],
              tableSelector: "#" + random_id
            })
            App.modal({
              selector: "#myModal",
              autoClose: false,
              header: "Search #{struct}",
              content: `
              <div id="#{singular}">

              </div>`
            })
            #{singular}Source2.load(makeid(4), '##{singular}')
            #{singular}Source2.table.on("draw", function() {
              if ($("#search_user").length == 0) {
                $(".module_buttons").prepend(`
                  <label class="col-form-label " for="inputSmall">#{struct} </label>
                  <input class="mx-4 form-control form-control-sm" id="search_user"></input>
                            `)
              }
              $('input#search_user').on('change', function(e) {
                var query = $(this).val()
                #{singular}Source2.table
                  .columns(0)
                  .search(query)
                  .draw();
              })
            })
          }




      """
      |> IO.puts()
  end

  def upload_file(params) do
    check_upload =
      Map.values(params)
      |> Enum.with_index()
      |> Enum.filter(fn x -> is_map(elem(x, 0)) end)
      |> Enum.filter(fn x -> :__struct__ in Map.keys(elem(x, 0)) end)
      |> Enum.filter(fn x -> elem(x, 0).__struct__ == Plug.Upload end)

    if check_upload != [] do
      file_plug = hd(check_upload) |> elem(0)
      index = hd(check_upload) |> elem(1)

      check = File.exists?(File.cwd!() <> "/media")

      path =
        if check do
          File.cwd!() <> "/media"
        else
          File.mkdir(File.cwd!() <> "/media")
          File.cwd!() <> "/media"
        end

      final =
        if is_map(file_plug) do
          IO.inspect(is_map(file_plug))
          fl = String.replace(file_plug.filename, "'", "")
          File.cp(file_plug.path, path <> "/#{fl}")
          "/images/uploads/#{fl}"
        else
          "/images/uploads/#{file_plug}"
        end

      Map.put(params, Enum.at(Map.keys(params), index), final)
    else
      params
    end
  end

  def create_new_bucket(bucket_name) do
    url = "https://api.linode.com/v4/object-storage/buckets"

    token = Application.get_env(:ex_aws, :pat)

    resp =
      HTTPoison.post(url, Poison.encode!(%{label: bucket_name, cluster: "ap-south-1"}), [
        {"Authorization", "Bearer #{token}"},
        {"Content-Type", "application/json"}
      ])

    case resp do
      {:ok, res} ->
        res.body |> Poison.decode!()

      {:error, error} ->
        IO.inspect(error)
        ""
    end
  end

  def list_bucket() do
    token = Application.get_env(:ex_aws, :pat)

    # `44675ea568c8d8605fe7af0bf7ce66de28f751f25cc62b87fff970080f31b31f
    resp =
      HTTPoison.get("https://api.linode.com/v4/object-storage/buckets", [
        {"Authorization", "Bearer #{token}"}
      ])

    case resp do
      {:ok, res} ->
        res.body |> Poison.decode!()

      {:error, error} ->
        IO.inspect(error)
        ""
    end
  end

  def s3_large_upload(filename) do
    opts = [acl: :public_read]

    check = File.exists?(File.cwd!() <> "/media")

    path =
      if check do
        File.cwd!() <> "/media"
      else
        File.mkdir(File.cwd!() <> "/media")
        File.cwd!() <> "/media"
      end

    res =
      "#{path}/#{filename}"
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("cac-bucket", filename, opts)
      |> ExAws.request!()

    data = res.body |> SweetXml.parse()
    IO.inspect(data |> Tuple.to_list())
    :ok
  end
end
