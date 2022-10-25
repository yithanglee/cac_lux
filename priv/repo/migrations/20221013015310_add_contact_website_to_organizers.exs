defmodule Cac.Repo.Migrations.AddContactWebsiteToOrganizers do
  use Ecto.Migration

  def change do
    alter table("organizers") do 
      add :contact_html, :binary 
      add :contact_phone, :string
      add :contact_email, :string  
    end 
  end
end
