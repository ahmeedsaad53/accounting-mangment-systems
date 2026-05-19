namespace zadan.Data
{
    public class Product
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;

        public decimal Price { get; set; }

        public List<BillItem>? BillItems { get; set; }
        public int Stock { get; set; }  // ا
    }

}
