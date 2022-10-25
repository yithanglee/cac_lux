defmodule Cac.Repo.Migrations.CreateSpeakers do
  use Ecto.Migration

  def change do
    create table(:speakers) do
      add :name, :string
      add :title, :string
      add :bio, :binary
      add :img_url, :string
      add :contact_html, :binary
      add :contact_phone, :string
      add :contact_email, :string

      timestamps()
    end

  end
end
