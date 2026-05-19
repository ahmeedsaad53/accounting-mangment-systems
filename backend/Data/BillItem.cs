namespace zadan.Data
{
    public class BillItem
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int BillId { get; set; }
        public Bill Bill { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; } // سعر المنتج وقت البيع
    }
}
