using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using zadan.Data;
using zadan.DTO;

namespace zadan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]

        public IActionResult GetProduct()
        {
            List<Product> productsList = _context.Products.ToList();
            return Ok(productsList);
        }
        [HttpPost]
        public IActionResult addProduct(ProductDTO dto)
        {
            var Prod = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                Type = dto.Type
            };
            _context.Products.Add(Prod);
            _context.SaveChanges();
            return Ok();
        }
        [HttpPut("{id:int}")]
        [Authorize]

        public IActionResult updateProduct(int Id,ProductDTO productDTO)
        { 
            Product productFormDb = _context.Products.SingleOrDefault(p => p.Id == Id);
            if (productFormDb != null)
            {
                productFormDb.Name = productDTO.Name;
                productFormDb.Price = productDTO.Price;
                productFormDb.Stock = productDTO.Stock;
                productFormDb.Type = productDTO.Type;
                _context.SaveChanges();
                return Created();
            }
            else return NotFound();


        }
        [HttpDelete("{id:int}")]
        [Authorize]

        public ActionResult deleteProduct(int Id)
        {
            var ProductDb = _context.Products.FirstOrDefault(x => x.Id == Id);
            if (ProductDb != null)
            {
                _context.Remove(ProductDb);
                _context.SaveChanges();
                return NoContent();
            }
            else { return NotFound(); }


        }
        [HttpPut("add-stock/{id}")]
        [Authorize]

        public IActionResult updateStock(int id, ProductDTO productDTO)
        {
            Product productFormDb = _context.Products.SingleOrDefault(p => p.Id == id);
            if (productFormDb != null)
            {
                productFormDb.Stock = productDTO.Stock;
                _context.SaveChanges();
                return Created();
            }
            else return NotFound();


        }

    }

}
