defmodule Cac.Repo.Migrations.CreateFacebookPages do
  use Ecto.Migration

  def change do
    create table(:facebook_pages) do
      add :user_id, :integer
      add :page_id, :string
      add :name, :string
      add :page_access_token, :binary

      timestamps()
    end

  end
end
