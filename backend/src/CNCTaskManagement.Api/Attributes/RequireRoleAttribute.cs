using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Api.Attributes
{
    /// <summary>
    /// Custom authorization attribute to check user roles
    /// </summary>
    public class RequireRoleAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        private readonly UserRole[] _roles;

        public RequireRoleAttribute(params UserRole[] roles)
        {
            _roles = roles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            
            // Check if user is authenticated
            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Check if user has any of the required roles
            bool hasRequiredRole = false;
            foreach (var role in _roles)
            {
                if (user.IsInRole(role.ToString()))
                {
                    hasRequiredRole = true;
                    break;
                }
            }

            if (!hasRequiredRole)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}