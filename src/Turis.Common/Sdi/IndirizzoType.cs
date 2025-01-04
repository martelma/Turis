namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class IndirizzoType {
    
        private string indirizzoField;
    
        private string numeroCivicoField;
    
        private string cAPField;
    
        private string comuneField;
    
        private string provinciaField;
    
        private string nazioneField;
    
        public IndirizzoType() {
            this.nazioneField = "IT";
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Indirizzo {
            get {
                return this.indirizzoField;
            }
            set {
                this.indirizzoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumeroCivico {
            get {
                return this.numeroCivicoField;
            }
            set {
                this.numeroCivicoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CAP {
            get {
                return this.cAPField;
            }
            set {
                this.cAPField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Comune {
            get {
                return this.comuneField;
            }
            set {
                this.comuneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Provincia {
            get {
                return this.provinciaField;
            }
            set {
                this.provinciaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Nazione {
            get {
                return this.nazioneField;
            }
            set {
                this.nazioneField = value;
            }
        }
    }
}