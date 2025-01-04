using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    [System.Xml.Serialization.XmlRootAttribute("FatturaElettronica", Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2", IsNullable=false)]
    public class FatturaElettronicaType {
    
        private FatturaElettronicaHeaderType fatturaElettronicaHeaderField;
    
        private FatturaElettronicaBodyType[] fatturaElettronicaBodyField;
    
        private FormatoTrasmissioneType versioneField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public FatturaElettronicaHeaderType FatturaElettronicaHeader {
            get {
                return this.fatturaElettronicaHeaderField;
            }
            set {
                this.fatturaElettronicaHeaderField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("FatturaElettronicaBody", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public FatturaElettronicaBodyType[] FatturaElettronicaBody {
            get {
                return this.fatturaElettronicaBodyField;
            }
            set {
                this.fatturaElettronicaBodyField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlAttributeAttribute()]
        public FormatoTrasmissioneType versione {
            get {
                return this.versioneField;
            }
            set {
                this.versioneField = value;
            }
        }
    }
}