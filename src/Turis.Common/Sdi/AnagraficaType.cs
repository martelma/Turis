namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class AnagraficaType {
    
        private string denominazioneField;
        private string cognomeField;
        private string nomeField;
        private string titoloField;
        private string codEORIField;
    
        [System.Xml.Serialization.XmlElementAttribute("Denominazione", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Denominazione
        {
            get
            {
                return this.denominazioneField;
            }
            set
            {
                this.denominazioneField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("Cognome", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Cognome
        {
            get
            {
                return this.cognomeField;
            }
            set
            {
                this.cognomeField = value;
            }
        }

        [System.Xml.Serialization.XmlElementAttribute("Nome", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Nome
        {
            get
            {
                return this.nomeField;
            }
            set
            {
                this.nomeField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Titolo {
            get {
                return this.titoloField;
            }
            set {
                this.titoloField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CodEORI {
            get {
                return this.codEORIField;
            }
            set {
                this.codEORIField = value;
            }
        }
    }
}