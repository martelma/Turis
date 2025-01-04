namespace Turis.Common.Sdi
{
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class AltriDatiGestionaliType {
    
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string TipoDato { get; set; }

        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string RiferimentoTesto { get; set; }

        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal RiferimentoNumero { get; set; }

        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool RiferimentoNumeroSpecified { get; set; }

        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime RiferimentoData { get; set; }

        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool RiferimentoDataSpecified { get; set; }
    }
}