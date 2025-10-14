namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Encryption service interface
    /// </summary>
    public interface IEncryptionService
    {
        /// <summary>
        /// Encrypt a string
        /// </summary>
        string Encrypt(string plainText);

        /// <summary>
        /// Decrypt a string
        /// </summary>
        string Decrypt(string cipherText);

        /// <summary>
        /// Generate a random salt
        /// </summary>
        string GenerateSalt();

        /// <summary>
        /// Hash a password with salt
        /// </summary>
        string HashPassword(string password, string salt);

        /// <summary>
        /// Verify a password against a hash
        /// </summary>
        bool VerifyPassword(string password, string salt, string hash);
    }
}