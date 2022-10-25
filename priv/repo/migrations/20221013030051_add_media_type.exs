defmodule Cac.Repo.Migrations.AddMediaType do
  use Ecto.Migration

  def change do
    alter table("blogs") do
      add :attachment_id, :integer
    end
  end
end
