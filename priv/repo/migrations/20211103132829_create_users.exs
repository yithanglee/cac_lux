defmodule Lux.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :username, :string
      add :full_name, :string
      add :bio, :binary
      add :email, :string
      add :phone, :string
      add :password, :string
      add :user_access_token, :string
      add :crypted_password, :binary
      add :fb_user_id, :string
      add :fb_psid, :string
      add :image_url, :string
      add :role_id, :integer
      timestamps()
    end

  end
end
