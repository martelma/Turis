namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiDDTType {
    
        private string numeroDDTField;
    
        private System.DateTime dataDDTField;
    
        private string[] riferimentoNumeroLineaField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumeroDDT {
            get {
                return this.numeroDDTField;
            }
            set {
                this.numeroDDTField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataDDT {
            get {
                return this.dataDDTField;
            }
            set {
                this.dataDDTField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("RiferimentoNumeroLinea", Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="integer")]
        public string[] RiferimentoNumeroLinea {
            get {
                return this.riferimentoNumeroLineaField;
            }
            set {
                this.riferimentoNumeroLineaField = value;
            }
        }
    }
}