using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Encryption service implementation
    /// </summary>
    public class EncryptionService : IEncryptionService
    {
        private readonly string _encryptionKey;
        private readonly string _salt;

        public EncryptionService(IConfiguration configuration)
        {
            _encryptionKey = configuration["EncryptionSettings:Key"] ?? throw new InvalidOperationException("Encryption key is not configured");
            _salt = configuration["EncryptionSettings:Salt"] ?? throw new InvalidOperationException("Encryption salt is not configured");
        }

        /// <summary>
        /// Encrypt a string
        /// </summary>
        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                return string.Empty;

            using (var aes = Aes.Create())
            {
                // Derive key from the configured key and salt
                var key = Rfc2898DeriveBytes.Pbkdf2(
                    Encoding.UTF8.GetBytes(_encryptionKey),
                    Encoding.UTF8.GetBytes(_salt),
                    10000,
                    HashAlgorithmName.SHA256,
                    32);

                aes.Key = key;
                aes.GenerateIV();

                using (var encryptor = aes.CreateEncryptor())
                using (var msEncrypt = new MemoryStream())
                {
                    // Write IV to the beginning of the stream
                    msEncrypt.Write(aes.IV, 0, aes.IV.Length);

                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }

                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        /// <summary>
        /// Decrypt a string
        /// </summary>
        public string Decrypt(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText))
                return string.Empty;

            try
            {
                var fullCipher = Convert.FromBase64String(cipherText);

                using (var aes = Aes.Create())
                {
                    // Derive key from the configured key and salt
                    var key = Rfc2898DeriveBytes.Pbkdf2(
                        Encoding.UTF8.GetBytes(_encryptionKey),
                        Encoding.UTF8.GetBytes(_salt),
                        10000,
                        HashAlgorithmName.SHA256,
                        32);

                    // Get IV from the beginning of the cipher
                    var iv = new byte[aes.BlockSize / 8];
                    Array.Copy(fullCipher, 0, iv, 0, iv.Length);

                    aes.Key = key;
                    aes.IV = iv;

                    using (var decryptor = aes.CreateDecryptor())
                    using (var msDecrypt = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length))
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    using (var srDecrypt = new StreamReader(csDecrypt))
                    {
                        return srDecrypt.ReadToEnd();
                    }
                }
            }
            catch
            {
                // Return empty string if decryption fails
                return string.Empty;
            }
        }

        /// <summary>
        /// Generate a random salt
        /// </summary>
        public string GenerateSalt()
        {
            var randomBytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        /// <summary>
        /// Hash a password with salt
        /// </summary>
        public string HashPassword(string password, string salt)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(salt))
                return string.Empty;

            // Derive a 256-bit hash using PBKDF2
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                Convert.FromBase64String(salt),
                10000,
                HashAlgorithmName.SHA256,
                32);

            return Convert.ToBase64String(hash);
        }

        /// <summary>
        /// Verify a password against a hash
        /// </summary>
        public bool VerifyPassword(string password, string salt, string hash)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(salt) || string.IsNullOrEmpty(hash))
                return false;

            // Hash the provided password with the same salt
            var computedHash = HashPassword(password, salt);

            // Compare the computed hash with the stored hash
            return computedHash == hash;
        }
    }
}