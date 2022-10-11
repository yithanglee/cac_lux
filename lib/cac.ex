defmodule Cac do
  @moduledoc """
  Cac keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """
  import Mogrify
  import Ecto.Query

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

    get_content = fn post ->
      post |> Map.get("content") |> Map.get("rendered")
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

        fl = tail |> String.replace("/", "_") |> IO.inspect()

        %HTTPoison.Response{body: body} = HTTPoison.get!(url)
        File.write!("#{path}/#{fl}", body)

        {:ok, sm} =
          Cac.Settings.create_stored_media(%{img_url: "/images/uploads/#{fl}", name: fl})

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

    {:ok, blog} = Cac.Settings.create_blog(attrs) |> IO.inspect()

    %{
      "_links" => %{
        "about" => [
          %{"href" => "http://www.methodist.org.my/wp-json/wp/v2/types/post"}
        ],
        "author" => [
          %{
            "embeddable" => true,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/users/4"
          }
        ],
        "collection" => [
          %{"href" => "http://www.methodist.org.my/wp-json/wp/v2/posts"}
        ],
        "curies" => [
          %{
            "href" => "https://api.w.org/{rel}",
            "name" => "wp",
            "templated" => true
          }
        ],
        "predecessor-version" => [
          %{
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/posts/17834/revisions/17838",
            "id" => 17838
          }
        ],
        "replies" => [
          %{
            "embeddable" => true,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/comments?post=17834"
          }
        ],
        "self" => [
          %{"href" => "http://www.methodist.org.my/wp-json/wp/v2/posts/17834"}
        ],
        "version-history" => [
          %{
            "count" => 1,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/posts/17834/revisions"
          }
        ],
        "wp:attachment" => [
          %{
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/media?parent=17834"
          }
        ],
        "wp:featuredmedia" => [
          %{
            "embeddable" => true,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/media/17836"
          }
        ],
        "wp:term" => [
          %{
            "embeddable" => true,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/categories?post=17834",
            "taxonomy" => "category"
          },
          %{
            "embeddable" => true,
            "href" => "http://www.methodist.org.my/wp-json/wp/v2/tags?post=17834",
            "taxonomy" => "post_tag"
          }
        ]
      },
      "author" => 4,
      "author_info" => %{
        "author_link" => "http://www.methodist.org.my/author/damien/",
        "display_name" => "damien"
      },
      "categories" => '\f',
      "category_info" =>
        "<a href=\"http://www.methodist.org.my/category/latest-news/%e4%bb%a3%e7%a5%b7%e4%ba%8b%e9%a1%b9/\" rel=\"category tag\">代祷事项</a>",
      "comment_status" => "closed",
      "content" => %{
        "protected" => false,
        "rendered" =>
          "<a href=\"http://www.methodist.org.my/wp-content/uploads/2022/03/CAC-2022年3月祷告通讯.pdf\" class=\"pdfemb-viewer\" style=\"\" data-width=\"max\" data-height=\"max\"  data-toolbar=\"bottom\" data-toolbar-fixed=\"off\">CAC-2022年3月祷告通讯<br/></a>\n<p class=\"wp-block-pdfemb-pdf-embedder-viewer\"></p>\n"
      },
      "date" => "2022-03-28T23:28:16",
      "date_gmt" => "2022-03-28T15:28:16",
      "excerpt" => %{"protected" => false, "rendered" => ""},
      "featured_image_urls" => %{
        "1536x1536" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "2048x2048" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "content-slide-thumbnail" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "covernews-featured" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "covernews-medium" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march-600x380.jpg",
          600,
          380,
          true
        ],
        "covernews-medium-square" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march-600x450.jpg",
          600,
          450,
          true
        ],
        "covernews-slider-center" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "covernews-slider-full" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "full" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "large" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "medium" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march-300x250.jpg",
          300,
          250,
          true
        ],
        "medium_large" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march.jpg",
          600,
          500,
          false
        ],
        "thumbnail" => [
          "http://www.methodist.org.my/wp-content/uploads/2022/03/march-150x150.jpg",
          150,
          150,
          true
        ]
      },
      "featured_media" => 17836,
      "format" => "standard",
      "guid" => %{"rendered" => "https://www.methodist.org.my/?p=17834"},
      "id" => 17834,
      "link" =>
        "http://www.methodist.org.my/2022/03/%e6%af%8f%e6%9c%88%e7%a5%b7%e5%91%8a%e9%80%9a%e6%8a%a5-monthly-prayer-bulletin-12/",
      "meta" => [],
      "modified" => "2022-03-28T23:28:23",
      "modified_gmt" => "2022-03-28T15:28:23",
      "ping_status" => "closed",
      "slug" =>
        "%e6%af%8f%e6%9c%88%e7%a5%b7%e5%91%8a%e9%80%9a%e6%8a%a5-monthly-prayer-bulletin-12",
      "status" => "publish",
      "sticky" => false,
      "tag_info" => "代祷事项",
      "tags" => [],
      "template" => "",
      "title" => %{"rendered" => "每月祷告通报 MONTHLY PRAYER BULLETIN"},
      "type" => "post"
    }
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
