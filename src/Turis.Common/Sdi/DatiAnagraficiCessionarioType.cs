namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiAnagraficiCessionarioType {
    
        private IdFiscaleType idFiscaleIVAField;
    
        private string codiceFiscaleField;
    
        private AnagraficaType anagraficaField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IdFiscaleType IdFiscaleIVA {
            get {
                return this.idFiscaleIVAField;
            }
            set {
                this.idFiscaleIVAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CodiceFiscale {
            get {
                return this.codiceFiscaleField;
            }
            set {
                this.codiceFiscaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public AnagraficaType Anagrafica {
            get {
                return this.anagraficaField;
            }
            set {
                this.anagraficaField = value;
            }
        }
    }
}