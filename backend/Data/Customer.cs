namespace zadan.Data
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Notes { get; set; }
        public List<Bill>? Bills { get; set; }

    }

}
