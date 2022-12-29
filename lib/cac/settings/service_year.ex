defmodule Cac.Settings.ServiceYear do
  use Ecto.Schema
  import Ecto.Changeset

  schema "service_years" do
    field :duration_in_months, :integer
    field :remarks, :string
    field :service_end, :date
    field :service_start, :date
    field :year, :integer

    timestamps()
  end

  @doc false
  def changeset(service_year, attrs) do
    service_year
    |> cast(attrs, [:year, :duration_in_months, :service_start, :service_end, :remarks])
    |> validate_required([:year, :duration_in_months, :service_start, :service_end, :remarks])
  end
end
