namespace zadan.DTO
{
    public class BillDto
    {
        public int? CustomerId { get; set; }

        public List<BillItemDto> Items { get; set; }
    }
}
