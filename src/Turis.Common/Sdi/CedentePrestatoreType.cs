namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class CedentePrestatoreType {
    
        private DatiAnagraficiCedenteType datiAnagraficiField;
    
        private IndirizzoType sedeField;
    
        private IndirizzoType stabileOrganizzazioneField;
    
        private IscrizioneREAType iscrizioneREAField;
    
        private ContattiType contattiField;
    
        private string riferimentoAmministrazioneField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiAnagraficiCedenteType DatiAnagrafici {
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
        public IscrizioneREAType IscrizioneREA {
            get {
                return this.iscrizioneREAField;
            }
            set {
                this.iscrizioneREAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public ContattiType Contatti {
            get {
                return this.contattiField;
            }
            set {
                this.contattiField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string RiferimentoAmministrazione {
            get {
                return this.riferimentoAmministrazioneField;
            }
            set {
                this.riferimentoAmministrazioneField = value;
            }
        }
    }
}