using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace zadan.Data


{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillItem> BillItems { get; set; }



        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // ⭐ REQUIRED
     
                modelBuilder.Entity<Bill>()//bill----billitem
                .HasMany(b => b.Items)
                .WithOne(i => i.Bill)
                .HasForeignKey(i => i.BillId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Product>().HasMany(b=>b.BillItems).WithOne(i => i.Product).HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);//product--billitem
            modelBuilder.Entity<Customer>().HasMany(b => b.Bills).WithOne(i => i.Customer).HasForeignKey(i => i.CustomerId).OnDelete(DeleteBehavior.SetNull);



            modelBuilder.Ignore<IdentityPasskeyData>(); // optional workaround
        }
    }


    public class ApplicationUser : IdentityUser
    {

    }
}


