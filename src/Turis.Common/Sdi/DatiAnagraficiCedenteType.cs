using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiAnagraficiCedenteType {
    
        private IdFiscaleType idFiscaleIVAField;
    
        private string codiceFiscaleField;
    
        private AnagraficaType anagraficaField;
    
        private string alboProfessionaleField;
    
        private string provinciaAlboField;
    
        private string numeroIscrizioneAlboField;
    
        private System.DateTime dataIscrizioneAlboField;
    
        private bool dataIscrizioneAlboFieldSpecified;
    
        private RegimeFiscaleType regimeFiscaleField;
    
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
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string AlboProfessionale {
            get {
                return this.alboProfessionaleField;
            }
            set {
                this.alboProfessionaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ProvinciaAlbo {
            get {
                return this.provinciaAlboField;
            }
            set {
                this.provinciaAlboField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumeroIscrizioneAlbo {
            get {
                return this.numeroIscrizioneAlboField;
            }
            set {
                this.numeroIscrizioneAlboField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataIscrizioneAlbo {
            get {
                return this.dataIscrizioneAlboField;
            }
            set {
                this.dataIscrizioneAlboField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataIscrizioneAlboSpecified {
            get {
                return this.dataIscrizioneAlboFieldSpecified;
            }
            set {
                this.dataIscrizioneAlboFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public RegimeFiscaleType RegimeFiscale {
            get {
                return this.regimeFiscaleField;
            }
            set {
                this.regimeFiscaleField = value;
            }
        }
    }
}