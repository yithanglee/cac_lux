defmodule Cac.Repo.Migrations.AddSocialMediaToVenues do
  use Ecto.Migration

  def change do
    alter table("venues") do
      add :website, :string
      add :fb, :string
      add :youtube, :string
      add :blog, :string
      add :fax, :string

    end
  end
end
