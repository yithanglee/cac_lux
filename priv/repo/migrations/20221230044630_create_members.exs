defmodule Cac.Repo.Migrations.CreateMembers do
  use Ecto.Migration

  def change do
    create table(:members) do
      add :name, :string
      add :code, :string
      add :cname, :string
      add :email, :string
      add :phone, :string
      add :line1, :string
      add :line2, :string
      add :area, :string
      add :postcode, :string
      add :uid, :string
      add :venue_id, :integer
      add :image_url, :string
      add :crypted_password, :string

      timestamps()
    end

  end
end
