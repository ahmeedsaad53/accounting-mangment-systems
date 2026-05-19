namespace zadan.Data
{
    public class Bill
    {
        public int Id { get; set; }

        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public decimal TotalAmount { get; set; }
        public List<Product>? Products { get; set; }


        public List<BillItem>? Items { get; set; }

   
       

        
    }
}
