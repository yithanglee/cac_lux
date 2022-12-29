defmodule Cac.Repo.Migrations.CreateServiceYears do
  use Ecto.Migration

  def change do
    create table(:service_years) do
      add :year, :integer
      add :duration_in_months, :integer
      add :service_start, :date
      add :service_end, :date
      add :remarks, :string

      timestamps()
    end

  end
end
