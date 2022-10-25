defmodule Cac.Repo.Migrations.AddImgUrlToEvents do
  use Ecto.Migration

  def change do
    alter table("events") do
      add :img_url, :string 
    end
  end
end
