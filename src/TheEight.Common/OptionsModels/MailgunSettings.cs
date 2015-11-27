namespace TheEight.Common.OptionsModels
{
    public class MailgunSettings
    {
        public SmtpSettings Smtp { get; set; }
        public ApiSettings Api { get; set; }

        public class SmtpSettings
        {
            public string Host { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }
            public int Port { get; set; }
        }

        public class ApiSettings
        {
            public string Url { get; set; }
            public string Key { get; set; }
        }
    }
}