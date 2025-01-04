namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class CessionarioCommittenteType {
    
        private DatiAnagraficiCessionarioType datiAnagraficiField;
    
        private IndirizzoType sedeField;
    
        private IndirizzoType stabileOrganizzazioneField;
    
        private RappresentanteFiscaleCessionarioType rappresentanteFiscaleField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiAnagraficiCessionarioType DatiAnagrafici {
            get {
                return this.datiAnagraficiField;
            }
            set {
                this.datiAnagraficiField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IndirizzoType Sede {
            get {
                return this.sedeField;
            }
            set {
                this.sedeField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IndirizzoType StabileOrganizzazione {
            get {
                return this.stabileOrganizzazioneField;
            }
            set {
                this.stabileOrganizzazioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public RappresentanteFiscaleCessionarioType RappresentanteFiscale {
            get {
                return this.rappresentanteFiscaleField;
            }
            set {
                this.rappresentanteFiscaleField = value;
            }
        }
    }
}