#!/bin/sh
sudo rm -r /usr/bin/elixir
echo unwanted2
. /home/damien/kerl/22.0/activate
sudo ln -s /home/damien/elixir/bin/elixir /usr/bin/elixir
sudo rm -r /usr/bin/iex
sudo ln -s /home/damien/elixir/bin/iex /usr/bin/iex
sudo rm -r /usr/bin/mix
sudo ln -s /home/damien/elixir/bin/mix /usr/bin/mix

source .env
iex -S mix phx.server