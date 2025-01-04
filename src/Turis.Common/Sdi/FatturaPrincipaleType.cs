namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class FatturaPrincipaleType {
    
        private string numeroFatturaPrincipaleField;
    
        private System.DateTime dataFatturaPrincipaleField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumeroFatturaPrincipale {
            get {
                return this.numeroFatturaPrincipaleField;
            }
            set {
                this.numeroFatturaPrincipaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataFatturaPrincipale {
            get {
                return this.dataFatturaPrincipaleField;
            }
            set {
                this.dataFatturaPrincipaleField = value;
            }
        }
    }
}