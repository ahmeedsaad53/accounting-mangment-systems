using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using zadan.DTO;
using zadan.Data;



namespace WeatherForCast.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager; // إضافة _ للتمييز

        public AccountController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager; // الآن القيمة ستنتقل بشكل صحيح
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto UserFromRequest)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser user = new ApplicationUser();
                user.UserName = UserFromRequest.UserName;
                user.Email = UserFromRequest.Email;

                // استخدم المتغير الذي تم تعيينه في الأعلى
                IdentityResult result = await _userManager.CreateAsync(user, UserFromRequest.Password);

                if (result.Succeeded)
                {
                    return Ok("User Created Successfully");
                }
                // بقية الكود...

                else
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                }
            }

            return BadRequest(ModelState);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto userFRomRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationUser userFormDb = await _userManager.FindByNameAsync(userFRomRequest.userName);
            if (userFormDb == null)
            {
                ModelState.AddModelError("InvalidCredentials", "The username or password is incorrect.");
                return BadRequest(ModelState);
            }

            bool isPasswordValid = await _userManager.CheckPasswordAsync(userFormDb, userFRomRequest.password);
            if (!isPasswordValid)
            {
                ModelState.AddModelError("InvalidCredentials", "The username or password is incorrect.");
                return BadRequest(ModelState);
            }

            List<Claim> userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userFormDb.Id?.ToString() ?? string.Empty),
                new Claim(ClaimTypes.Name, userFormDb.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var secretKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes("sgdsgd648d9f*/w43U4354t69ts8e22365fh")
);
            SigningCredentials signingCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);


            var userRoles = await _userManager.GetRolesAsync(userFormDb);
            foreach (var role in userRoles)
            {
                userClaims.Add(new Claim(ClaimTypes.Role, role));
            }
            //design the token
            JwtSecurityToken myToken = new JwtSecurityToken(
               issuer: "http://localhost:5097",
             audience: "http://localhost:5097",
                expires: DateTime.Now.AddHours(1),
                claims: userClaims,
                signingCredentials: signingCredentials
            );
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(myToken),
                expiration = DateTime.Now.AddHours(1)
            });
        }
    }
}
