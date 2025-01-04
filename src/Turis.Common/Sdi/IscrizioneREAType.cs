using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class IscrizioneREAType {
    
        private string ufficioField;
    
        private string numeroREAField;
    
        private decimal capitaleSocialeField;
    
        private bool capitaleSocialeFieldSpecified;
    
        private SocioUnicoType socioUnicoField;
    
        private bool socioUnicoFieldSpecified;
    
        private StatoLiquidazioneType statoLiquidazioneField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Ufficio {
            get {
                return this.ufficioField;
            }
            set {
                this.ufficioField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumeroREA {
            get {
                return this.numeroREAField;
            }
            set {
                this.numeroREAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal CapitaleSociale {
            get {
                return this.capitaleSocialeField;
            }
            set {
                this.capitaleSocialeField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool CapitaleSocialeSpecified {
            get {
                return this.capitaleSocialeFieldSpecified;
            }
            set {
                this.capitaleSocialeFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public SocioUnicoType SocioUnico {
            get {
                return this.socioUnicoField;
            }
            set {
                this.socioUnicoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool SocioUnicoSpecified {
            get {
                return this.socioUnicoFieldSpecified;
            }
            set {
                this.socioUnicoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public StatoLiquidazioneType StatoLiquidazione {
            get {
                return this.statoLiquidazioneField;
            }
            set {
                this.statoLiquidazioneField = value;
            }
        }
    }
}