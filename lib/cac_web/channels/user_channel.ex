defmodule CacWeb.UserChannel do
  use CacWeb, :channel

  @impl true
  def join("user:" <> room_id, payload, socket) do
    IO.inspect("room #{room_id}")

    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (user:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("get_question", payload, socket) do
    broadcast(socket, "get_question", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("question", payload, socket) do
    broadcast(socket, "question", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("answer", payload, socket) do
    broadcast(socket, "answer", payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(payload) do
    IO.inspect(payload)
    true
  end
end
