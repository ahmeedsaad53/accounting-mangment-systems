using zadan.Data;

namespace zadan.DTO
{
    public class ProductDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;

        public decimal Price { get; set; }

        public int Stock { get; set; }  
    }
}
