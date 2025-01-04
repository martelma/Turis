using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiRiepilogoType {
    
        private decimal aliquotaIVAField;
    
        private NaturaType naturaField;
    
        private bool naturaFieldSpecified;
    
        private decimal speseAccessorieField;
    
        private bool speseAccessorieFieldSpecified;
    
        private decimal arrotondamentoField;
    
        private bool arrotondamentoFieldSpecified;
    
        private decimal imponibileImportoField;
    
        private decimal impostaField;
    
        private EsigibilitaIVAType esigibilitaIVAField;
    
        private bool esigibilitaIVAFieldSpecified;
    
        private string riferimentoNormativoField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal AliquotaIVA {
            get {
                return this.aliquotaIVAField;
            }
            set {
                this.aliquotaIVAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public NaturaType Natura {
            get {
                return this.naturaField;
            }
            set {
                this.naturaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool NaturaSpecified {
            get {
                return this.naturaFieldSpecified;
            }
            set {
                this.naturaFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal SpeseAccessorie {
            get {
                return this.speseAccessorieField;
            }
            set {
                this.speseAccessorieField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool SpeseAccessorieSpecified {
            get {
                return this.speseAccessorieFieldSpecified;
            }
            set {
                this.speseAccessorieFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal Arrotondamento {
            get {
                return this.arrotondamentoField;
            }
            set {
                this.arrotondamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool ArrotondamentoSpecified {
            get {
                return this.arrotondamentoFieldSpecified;
            }
            set {
                this.arrotondamentoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImponibileImporto {
            get {
                return this.imponibileImportoField;
            }
            set {
                this.imponibileImportoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal Imposta {
            get {
                return this.impostaField;
            }
            set {
                this.impostaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public EsigibilitaIVAType EsigibilitaIVA {
            get {
                return this.esigibilitaIVAField;
            }
            set {
                this.esigibilitaIVAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool EsigibilitaIVASpecified {
            get {
                return this.esigibilitaIVAFieldSpecified;
            }
            set {
                this.esigibilitaIVAFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string RiferimentoNormativo {
            get {
                return this.riferimentoNormativoField;
            }
            set {
                this.riferimentoNormativoField = value;
            }
        }
    }
}