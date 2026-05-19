using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using zadan.Data;
using zadan.DTO;
namespace zadan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext context; 
        public CustomerController(AppDbContext _context)
        {
            context = _context;
        }
        [HttpGet]//get all
        [Authorize]

        public IActionResult GetCustomer()
        {
            List<Customer> customerList = context.Customers.ToList();
            return Ok(customerList);

        }
        [HttpPost]//add new customer
        [Authorize]

        public IActionResult PostCustomer(CustomerDTO dto)
        {
            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Notes = dto.Notes
            };

            context.Customers.Add(customer);
            context.SaveChanges();

            return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
        }
        [HttpPut("{id:int}")]//edit
        [Authorize]

        public IActionResult UpdataCustomer(int id,CustomerDTO customer)
        {

            Customer customFormDb =context.Customers.FirstOrDefault(x => x.Id == id);
            if (customFormDb != null)
            {
                customFormDb.Name = customer.Name;
                customFormDb.Notes=customer.Notes;
                customFormDb.Phone=customer.Phone;
                context.SaveChanges();
                return NoContent();
            }
            else
            {
                return NotFound();
            }

        }
        [HttpDelete("{id:int}")]
        [Authorize]

        public IActionResult DeleteCustomer(int id)
        {
            var customerDb =context.Customers.FirstOrDefault(x=>x.Id == id);
            if(customerDb != null)
            {
                context.Remove(customerDb);
                context.SaveChanges();
                return NoContent();
            }
            else { return NotFound(); }



        }
        [HttpGet("{id:int}")]
        [Authorize]

        public IActionResult GetCustomerById(int id)
        {
            Customer customerDb =context.Customers.FirstOrDefault(x=>x.Id == id);
            if (customerDb == null)
                return NotFound();

            return Ok(customerDb);


        }
    }
}
