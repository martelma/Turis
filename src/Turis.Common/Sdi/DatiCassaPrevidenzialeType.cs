using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiCassaPrevidenzialeType {
    
        private TipoCassaType tipoCassaField;
    
        private decimal alCassaField;
    
        private decimal importoContributoCassaField;
    
        private decimal imponibileCassaField;
    
        private bool imponibileCassaFieldSpecified;
    
        private decimal aliquotaIVAField;
    
        private RitenutaType ritenutaField;
    
        private bool ritenutaFieldSpecified;
    
        private NaturaType naturaField;
    
        private bool naturaFieldSpecified;
    
        private string riferimentoAmministrazioneField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public TipoCassaType TipoCassa {
            get {
                return this.tipoCassaField;
            }
            set {
                this.tipoCassaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal AlCassa {
            get {
                return this.alCassaField;
            }
            set {
                this.alCassaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImportoContributoCassa {
            get {
                return this.importoContributoCassaField;
            }
            set {
                this.importoContributoCassaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImponibileCassa {
            get {
                return this.imponibileCassaField;
            }
            set {
                this.imponibileCassaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool ImponibileCassaSpecified {
            get {
                return this.imponibileCassaFieldSpecified;
            }
            set {
                this.imponibileCassaFieldSpecified = value;
            }
        }
    
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
        public RitenutaType Ritenuta {
            get {
                return this.ritenutaField;
            }
            set {
                this.ritenutaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool RitenutaSpecified {
            get {
                return this.ritenutaFieldSpecified;
            }
            set {
                this.ritenutaFieldSpecified = value;
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