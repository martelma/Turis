namespace Turis.BusinessLayer.Settings;

public class AppSettings
{
    public string PasswordRecoveryCallbackUrl { get; set; }
    public string ApplicationUrl { get; set; }
    public bool SkipInvioFattura { get; set; }
    public string UrlFatturaElettronicaAttiva { get; set; }
    public string XmlFilePath { get; set; }
    public decimal ImportoBollo { get; set; }
    public decimal SogliaBollo { get; set; }
    public string CodiceAliquotaIvaBollo { get; set; }
    public string CodiceFiscalePrestatore { get; set; }
    public string CodiceFiscaleTrasmittente { get; set; }
    public string DenominazionePrestatore { get; set; }
    public string IndirizzoPrestatore { get; set; }
    public string CapPrestatore { get; set; }
    public string ComunePrestatore { get; set; }
    public string ProvinciaPrestatore { get; set; }
    public string CodiceCliente { get; set; }
    public string Password{ get; set; }
}
