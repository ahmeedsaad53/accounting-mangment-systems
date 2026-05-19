using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using zadan.Data;
using zadan.DTO;

namespace zadan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BillController(AppDbContext context)
        {
            _context = context;
        }

        // CREATE BILL
        [HttpPost]
        [Authorize]
        public IActionResult CreateBill(BillDto dto)
        {
            // CHECK ITEMS
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("Bill must contain at least one item");

            // CHECK CUSTOMER
            var customer = _context.Customers
                .FirstOrDefault(c => c.Id == dto.CustomerId);

            if (customer == null)
                return BadRequest("Customer not found");

            // CREATE BILL
            var bill = new Bill
            {
                CustomerId = dto.CustomerId,
                Date = DateTime.Now,
                Items = new List<BillItem>()
            };

            decimal total = 0;

            // GROUP SAME PRODUCTS
            foreach (var groupedItem in dto.Items.GroupBy(x => x.ProductId))
            {
                var totalQuantity = groupedItem.Sum(x => x.Quantity);

                // GET PRODUCT
                var product = _context.Products
                    .FirstOrDefault(x => x.Id == groupedItem.Key);

                if (product == null)
                    return BadRequest(
                        $"Product with ID {groupedItem.Key} not found"
                    );

                // CHECK QUANTITY
                if (totalQuantity <= 0)
                    return BadRequest(
                        "Quantity must be greater than 0"
                    );

                // CHECK STOCK
                if (product.Stock < totalQuantity)
                    return BadRequest(
                        $"Not enough stock for product {product.Name}"
                    );

                // REDUCE STOCK
                product.Stock -= totalQuantity;

                // CREATE BILL ITEM
                var billItem = new BillItem
                {
                    ProductId = product.Id,
                    Quantity = totalQuantity,
                    Price = product.Price
                };

                // ADD TO TOTAL
                total += product.Price * totalQuantity;

                // ADD ITEM TO BILL
                bill.Items.Add(billItem);
            }

            // SET TOTAL
            bill.TotalAmount = total;

            // SAVE BILL
            _context.Bills.Add(bill);

            _context.SaveChanges();

            return Ok(bill);
        }

        // GET ALL BILLS
        [HttpGet("Bills")]
        [Authorize]
        public IActionResult GetBill()
        {
            var bills = _context.Bills
                .Include(x => x.Customer)
                .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                .ToList();

            return Ok(bills);
        }

        // GET BILL BY ID
        [HttpGet("Bills/{id:int}")]
        [Authorize]
        public IActionResult GetBill(int id)
        {
            var bill = _context.Bills
                .Include(x => x.Customer)
                .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                .FirstOrDefault(x => x.Id == id);

            if (bill == null)
                return NotFound();

            return Ok(bill);
        }

        // DELETE BILL
        [HttpDelete("{id:int}")]
        [Authorize]
        public IActionResult DeleteBill(int id)
        {
            var bill = _context.Bills
                .Include(x => x.Items)
                .FirstOrDefault(x => x.Id == id);

            if (bill == null)
                return NotFound();

            // RETURN STOCK
            foreach (var item in bill.Items)
            {
                var product = _context.Products
                    .FirstOrDefault(x => x.Id == item.ProductId);

                if (product != null)
                {
                    product.Stock += item.Quantity;
                }
            }

            _context.Bills.Remove(bill);

            _context.SaveChanges();

            return NoContent();
        }
    }
}