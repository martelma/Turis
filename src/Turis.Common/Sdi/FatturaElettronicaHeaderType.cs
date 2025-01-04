using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class FatturaElettronicaHeaderType {
    
        private DatiTrasmissioneType datiTrasmissioneField;
    
        private CedentePrestatoreType cedentePrestatoreField;
    
        private RappresentanteFiscaleType rappresentanteFiscaleField;
    
        private CessionarioCommittenteType cessionarioCommittenteField;
    
        private TerzoIntermediarioSoggettoEmittenteType terzoIntermediarioOSoggettoEmittenteField;
    
        private SoggettoEmittenteType soggettoEmittenteField;
    
        private bool soggettoEmittenteFieldSpecified;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiTrasmissioneType DatiTrasmissione {
            get {
                return this.datiTrasmissioneField;
            }
            set {
                this.datiTrasmissioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public CedentePrestatoreType CedentePrestatore {
            get {
                return this.cedentePrestatoreField;
            }
            set {
                this.cedentePrestatoreField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public RappresentanteFiscaleType RappresentanteFiscale {
            get {
                return this.rappresentanteFiscaleField;
            }
            set {
                this.rappresentanteFiscaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public CessionarioCommittenteType CessionarioCommittente {
            get {
                return this.cessionarioCommittenteField;
            }
            set {
                this.cessionarioCommittenteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public TerzoIntermediarioSoggettoEmittenteType TerzoIntermediarioOSoggettoEmittente {
            get {
                return this.terzoIntermediarioOSoggettoEmittenteField;
            }
            set {
                this.terzoIntermediarioOSoggettoEmittenteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public SoggettoEmittenteType SoggettoEmittente {
            get {
                return this.soggettoEmittenteField;
            }
            set {
                this.soggettoEmittenteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool SoggettoEmittenteSpecified {
            get {
                return this.soggettoEmittenteFieldSpecified;
            }
            set {
                this.soggettoEmittenteFieldSpecified = value;
            }
        }
    }
}