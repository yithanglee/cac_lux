defmodule FacebookHelper do
  import Ecto.Query
  import CacWeb.Gettext
  alias Cac.{Settings, Repo}
  require Logger
  # alias Settings.{ShopProduct, FacebookPage, PageVisitor}

  @app_secret Application.get_env(:cac, :facebook)[:app_secret]
  @app_id Application.get_env(:cac, :facebook)[:app_id]

  def get_psid(id, fb_page_id, page_access_token) do
    app_proof = ""
    HTTPoison.get("https://graph.facebook.com/v12.0/#{id}/ids_for_pages?
  page=<OPTIONAL_PAGE_ID>
  &access_token=#{page_access_token}
  &appsecret_proof=#{app_proof}")
  end

  def get_user_manage_pages(user_id, user_access_token) do
    url =
      "https://graph.facebook.com/#{user_id}/accounts?fields=name,access_token&access_token=#{
        user_access_token
      }"

    res = HTTPoison.get(url)

    case res do
      {:ok, resp} ->
        body = Jason.decode!(resp.body)
        IO.inspect(body)
    end
  end

  def page_post(page_id, page_access_token) do
    url =
      "https://graph.facebook.com/#{page_id}/feed?fields=full_picture,id,story,attachments{media},message,story_tags,message_tags&access_token=#{
        page_access_token
      }"

    {:ok, resp} = HTTPoison.get(url)
    Jason.decode!(resp.body)
  end

  def get_user_existing_pages(user_id) do
    user = Cac.Settings.get_user_by_fb_user_id(user_id)
    page_ids = user.facebook_pages |> Enum.map(& &1.page_id)

    url =
      "https://graph.facebook.com/#{user_id}/accounts?fields=name,access_token&access_token=#{
        user.user_access_token
      }"

    res = HTTPoison.get(url)

    case res do
      {:ok, resp} ->
        %{"data" => fb_page_list} = Jason.decode!(resp.body)
        # IO.inspect(body) 
        for fb_page <- fb_page_list do
          unless fb_page["id"] in page_ids do
            {:ok, page} =
              Cac.Settings.create_facebook_page(%{
                user_id: user.id,
                page_id: fb_page["id"],
                name: fb_page["name"],
                page_access_token: fb_page["access_token"]
              })

            page |> BluePotion.s_to_map()
          else
            user.facebook_pages
            |> Enum.filter(&(&1.page_id == fb_page["id"]))
            |> List.first()
            |> BluePotion.s_to_map()
          end
        end
    end
  end

  def get_app_token() do
    url =
      "https://graph.facebook.com/oauth/access_token?client_id=#{@app_id}&client_secret=#{
        @app_secret
      }&grant_type=client_credentials"

    res = HTTPoison.get(url)

    case res do
      {:ok, resp} ->
        body = Jason.decode!(resp.body)
        IO.inspect(body)
    end
  end

  def inspect_token(token) do
    %{
      "access_token" => app_token,
      "token_type" => token2
    } = get_app_token()

    url = "https://graph.facebook.com/debug_token?input_token=#{token}&access_token=#{app_token}"
    IO.inspect(url)
    res = HTTPoison.get(url)

    case res do
      {:ok, resp} ->
        body = Jason.decode!(resp.body)
        IO.inspect(body)
    end
  end

  def get_user_access_token() do
    res =
      HTTPoison.get(
        "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=#{
          @app_id
        }&client_secret=#{@app_secret}&fb_exchange_token=#{@user_access_token}"
      )

    case res do
      {:ok, resp} ->
        %{"access_token" => access_token, "token_type" => token_type} = Jason.decode!(resp.body)
        IO.inspect(access_token)
    end
  end

  # def create_identities(webhook_event, sender_psid) do
  #   company = Repo.get_by(User, page_id: webhook_event["recipient"]["id"])

  #   company =
  #     if company == nil do
  #       {:ok, company} =
  #         Settings.create_company(%{
  #           page_id: webhook_event["recipient"]["id"]
  #         })

  #       company
  #     else
  #       company
  #     end

  #   vc = Repo.get_by(VisitorCompany, psid: sender_psid)

  #   vc =
  #     if vc == nil do
  #       {:ok, vc} =
  #         FbTool.Settings.create_visitor_company(%{
  #           psid: webhook_event["sender"]["id"],
  #           recepient_id: webhook_event["recipient"]["id"],
  #           company_id: company.id
  #         })

  #       vc
  #     else
  #       vc
  #     end

  #   # Task.start_link(__MODULE__, :update_fb_vc, [sender_psid, vc])
  #   update_fb_vc(sender_psid, vc)
  # end

  # def update_fb_vc(sender_psid, vc) do
  #   company = Repo.get(Company, vc.company_id)

  #   if company.page_access_token != nil do
  #     response =
  #       HTTPoison.get!(
  #         "https://graph.facebook.com/v7.0/#{sender_psid}?access_token=#{
  #           company.page_access_token
  #         }"
  #       )

  #     body = response.body
  #     IO.puts(body)
  #     {:ok, map_user} = Jason.decode(body)
  #     name = map_user["first_name"] <> " " <> map_user["last_name"]

  #     res = Repo.all(from v in Visitor, where: v.name == ^name)

  #     visitor =
  #       if res == [] do
  #         {:ok, visitor} = Settings.create_visitor(%{name: name})
  #         visitor
  #       else
  #         hd(res)
  #       end

  #     pc =
  #       if map_user["profile_pic"] != nil do
  #         map_user["profile_pic"]
  #       else
  #         nil
  #       end

  #     {:ok, visitor} = FbTool.Settings.update_visitor(visitor, %{name: name, image_url: pc})

  #     Settings.update_visitor_company(vc, %{visitor_id: visitor.id})
  #   end
  # end

  def handleMessage(page, page_visitor, received_message) do
    IO.inspect(received_message)

    # visitor = Repo.get(Visitor, vc.visitor_id)
    lang = "en"

    base_url = Application.get_env(:cac, :facebook)[:base_url]
    # visitor.lang
    Gettext.put_locale(FbToolWeb.Gettext, lang)

    # buy product

    # check order

    responses =
      cond do
        received_message["text"] != nil ->
          text = String.downcase(received_message["text"])

          cond do
            text == "hi" ->
              [
                %{
                  "attachment" => %{
                    "type" => "template",
                    "payload" => %{
                      "template_type" => "button",
                      "text" =>
                        gettext(
                          "hi! Thanks for reaching out! Please choose the following to continue. "
                        ),
                      "buttons" => [
                        %{
                          "type" => "web_url",
                          "url" => "#{base_url}/show_page",
                          "title" => "Update Details",
                          "webview_height_ratio" => "tall"
                        },
                        # %{
                        #   "type" => "postback",
                        #   "title" => "Buy Product",
                        #   "payload" => "buy_product"
                        # },
                        %{
                          "type" => "postback",
                          "title" => "Check Order",
                          "payload" => "check_order"
                        },
                        %{
                          "type" => "postback",
                          "title" => "Live Agent",
                          "payload" => "live_agent"
                        }
                      ]
                    }
                  }
                }
              ]

            true ->
              # {:ok, vc} = FbTool.Settings.update_visitor_company(vc, %{msg_state: "idle"})
              [%{"text" => gettext("hi! We will get a human agent to contact you asap.")}]
          end

        received_message["attachments"] != nil ->
          [%{"text" => gettext("hi! We dont process attachments at the moment.")}]
      end

    callSendAPI(page.page_access_token, page_visitor, responses)
  end

  # button type postback, web_url 
  # nid postback button 0, payload
  # 
  def button_template(
        title,
        url,
        button_type_index \\ 1,
        payload \\ "end_check"
      ) do
    button_type = ["postback", "web_url"]

    case button_type_index do
      0 ->
        %{
          "type" => "postback",
          "title" => title,
          "payload" => payload
        }

      1 ->
        %{
          "type" => "web_url",
          "url" => "https://organiclovenewlife.com/#{url}",
          "title" => title
        }
    end
  end

  def tile_template(
        title,
        subtitle,
        image_url,
        button_list,
        button_url,
        payload \\ "end_check"
      ) do
    tile_type = %{
      "type" => "web_url",
      "url" => "https://organiclovenewlife.com/#{button_url}",
      "webview_height_ratio" => "tall"
    }

    %{
      "title" => title,
      "image_url" => "https://organiclovenewlife.com/#{image_url}",
      "subtitle" => subtitle,
      "default_action" => tile_type,
      "buttons" => button_list
    }
  end

  def list_template(list_of_tiles) do
    %{
      "attachment" => %{
        "type" => "template",
        "payload" => %{
          "template_type" => "generic",
          "elements" => list_of_tiles
        }
      }
    }
  end

  def handlePostback(page, page_visitor, received_postback) do
    lang = "en"

    base_url = Application.get_env(:cac, :facebook)[:base_url]
    payload = received_postback["payload"]

    IO.puts(payload)

    responses =
      cond do
        String.contains?(payload, "payment_done") ->
          co_id = String.split(payload, "payment_done:") |> List.last()
          # Cac.Settings.send_customer_order_to_accounting(co_id)
          [%{"text" => "Thank you for paying id: #{co_id}!"}]

        String.contains?(payload, "pay_now") ->
          co_id = String.split(payload, "pay_now:") |> List.last()
          co = Cac.Settings.get_customer_order!(co_id)

          case co.status do
            :pending_payment ->
              Cac.Settings.send_customer_order_to_accounting(co_id)
              [%{"text" => "Invoice for id: #{co_id} will deliver to you soon!"}]

            :paid ->
              [%{"text" => "Order id: #{co_id} has been paid!"}]

            :complete ->
              [%{"text" => "Order id: #{co_id} is completed!"}]

            _ ->
              [%{"text" => "Order id: #{co_id} is processing!"}]
          end

        String.contains?(payload, "thank_you_payment") ->
          co_id =
            String.split(payload, "thank_you_payment:")
            |> List.last()

          [
            %{
              "text" => "Thank you for paying id: #{co_id}, we will prepare your delivery soon!"
            }
          ]

        String.contains?(payload, "failed_payment") ->
          co_id = String.split(payload, "failed_payment:") |> List.last()

          [
            %{"text" => "Payment for id: #{co_id} was not successful!"},
            %{
              "attachment" => %{
                "type" => "template",
                "payload" => %{
                  "template_type" => "button",
                  "text" => gettext("What would you like to do now? "),
                  "buttons" => [
                    %{
                      "type" => "postback",
                      "title" => "Make Payment",
                      "payload" => "pay_now:#{co_id}"
                    },
                    %{
                      "type" => "web_url",
                      "url" => "#{base_url}/show_page?customer_order_id=#{co_id}",
                      "title" => "Change address/payment",
                      "webview_height_ratio" => "tall"
                    }
                  ]
                }
              }
            }
          ]

        payload == "make_payment" ->
          existing_carts = Cac.Settings.get_psid_orders(page_visitor)
          co = hd(existing_carts)

          total =
            Enum.map(co.customer_order_lines, & &1.sub_total)
            |> Enum.sum()
            |> Float.round(2)

          [
            %{
              "attachment" => %{
                "type" => "template",
                "payload" => %{
                  "template_type" => "button",
                  "text" => "Confirm to make payment, RM #{total}",
                  "buttons" => [
                    %{
                      "type" => "web_url",
                      "url" => co.payment_gateway_link,
                      "title" => "Pay Now",
                      "webview_height_ratio" => "tall"
                    }
                  ]
                }
              }
            }
          ]

        payload == "check_order" ->
          existing_carts = Cac.Settings.get_psid_orders(page_visitor)

          if existing_carts != [] do
            co = hd(existing_carts)

            [
              receipt_template(hd(existing_carts), page_visitor),
              %{
                "attachment" => %{
                  "type" => "template",
                  "payload" => %{
                    "template_type" => "button",
                    "text" => gettext("What would you like to do now? "),
                    "buttons" => [
                      %{
                        "type" => "postback",
                        "title" => "Make Payment",
                        "payload" => "pay_now:#{co.id}"
                      },
                      %{
                        "type" => "web_url",
                        "url" => "#{base_url}/show_page?customer_order_id=#{co.id}",
                        "title" => "Change address",
                        "webview_height_ratio" => "tall"
                      }
                    ]
                  }
                }
              }
            ]
          else
            [
              %{
                "attachment" => %{
                  "type" => "template",
                  "payload" => %{
                    "template_type" => "button",
                    "text" =>
                      gettext(
                        "There's no pending checkout orders. Please choose the following to continue. "
                      ),
                    "buttons" => [
                      %{
                        "type" => "postback",
                        "title" => "Check Status",
                        "payload" => "check_status"
                      },
                      %{
                        "type" => "postback",
                        "title" => "Check Order",
                        "payload" => "check_order"
                      }
                    ]
                  }
                }
              }
            ]
          end

        payload == "end_check" ->
          [
            %{
              "text" => "Thank you for your patronage!"
            }
          ]

        payload == "get_started" ->
          [
            %{
              "attachment" => %{
                "type" => "template",
                "payload" => %{
                  "template_type" => "button",
                  "text" => "Hi! Welcome to meshume!\nChoose a language.",
                  "buttons" => [
                    %{"type" => "postback", "title" => "English", "payload" => "lang_en"},
                    %{"type" => "postback", "title" => "中文", "payload" => "lang_zh"}
                  ]
                }
              }
            }
          ]

        payload == "lang_zh" ->
          # FbTool.Settings.update_visitor(visitor, %{lang: "zh"})
          # Gettext.put_locale(EcomBackendWeb.Gettext, "zh")

          [
            %{
              "text" => "你好！输入menu来开始！"
            }
          ]

        payload == "lang_en" ->
          # FbTool.Settings.update_visitor(visitor, %{lang: "en"})
          # Gettext.put_locale(EcomBackendWeb.Gettext, "en")

          [
            %{
              "text" => "Welcome! Type 'menu' to get started!"
            }
          ]

        payload == "checkout_now" ->
          existing_carts = []

          [
            receipt_template(hd(existing_carts), page_visitor),
            %{
              "attachment" => %{
                "type" => "template",
                "payload" => %{
                  "template_type" => "button",
                  "text" => gettext("What would you like to do now? "),
                  "buttons" => [
                    %{
                      "type" => "postback",
                      "title" => "Make Payment",
                      "payload" => "pay_now"
                    },
                    %{
                      "type" => "postback",
                      "title" => "Change address",
                      "payload" => "form_line1"
                    },
                    %{
                      "type" => "postback",
                      "title" => "Continue Shopping",
                      "payload" => "buy_product"
                    }
                  ]
                }
              }
            }
          ]

        true ->
          [%{"text" => gettext("Oops, try selecting another option!")}]
      end

    callSendAPI(page.page_access_token, page_visitor, responses)
  end

  def receipt_template(cart, visitor) do
    json_items =
      for item <- cart.customer_order_lines do
        %{
          "title" => item.item_name,
          "subtitle" => item.remarks,
          "quantity" => item.qty,
          "price" => item.cost_price,
          "currency" => "MYR"
        }
      end

    sb =
      for item <- cart.customer_order_lines do
        item.qty * item.cost_price
      end
      |> Enum.sum()
      |> Float.round(2)

    dt = DateTime.utc_now() |> DateTime.to_unix()

    [address, city, postcode, state] =
      if cart.delivery_address == nil do
        ["line1", "city", "postcode", "state"]
      else
        cart.delivery_address |> String.split("\r\n")
      end

    # {:ok, cart} =
    #   Settings.update_cart(cart, %{
    #     line1: visitor.line1,
    #     town: visitor.town,
    #     postcode: visitor.postcode,
    #     state: visitor.state
    #   })

    %{
      "attachment" => %{
        "type" => "template",
        "payload" => %{
          "template_type" => "receipt",
          "recipient_name" => visitor.name,
          "order_number" => cart.id,
          "currency" => "MYR",
          "payment_method" => "Online Transfer(FPX), Bank In Slip, Cash On Delivery",
          "order_url" => "",
          "timestamp" => "#{dt}",
          "address" => %{
            "street_1" => address,
            "city" => city,
            "postal_code" => postcode,
            "state" => state,
            "country" => "Malaysia"
          },
          "summary" => %{
            "subtotal" => sb,
            "shipping_cost" => 0.0,
            "total_tax" => 0.0,
            "total_cost" => sb
          },
          "elements" => json_items
        }
      }
    }
  end

  def callSendAPI(page_access_token, page_visitor, responses) do
    for response <- responses |> Enum.reject(fn x -> x == nil end) do
      request_body = %{"recipient" => %{"id" => page_visitor.psid}, "message" => response}
      {:ok, body_request} = Jason.encode(request_body)
      IO.puts(body_request)
      query = "access_token=#{page_access_token}"
      uri = "https://graph.facebook.com/v12.0/me/messages?#{query}"
      HTTPoison.start()
      IO.puts("start to send to facebook...")

      case HTTPoison.request(:post, uri, body_request, [{"Content-Type", "application/json"}], []) do
        {:ok, %HTTPoison.Response{body: body}} ->
          IO.puts(body)
          IO.puts("message sent!")

        {:error, %HTTPoison.Error{reason: reason}} ->
          IO.inspect(reason)

        {:ok, %HTTPoison.Response{status_code: 500, body: body}} ->
          IO.puts(body)
          IO.puts("message sent!")

        _ ->
          IO.puts("dont know how to catch this")
      end
    end
  end
end
