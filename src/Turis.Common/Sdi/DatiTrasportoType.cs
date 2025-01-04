namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiTrasportoType {
    
        private DatiAnagraficiVettoreType datiAnagraficiVettoreField;
    
        private string mezzoTrasportoField;
    
        private string causaleTrasportoField;
    
        private string numeroColliField;
    
        private string descrizioneField;
    
        private string unitaMisuraPesoField;
    
        private decimal pesoLordoField;
    
        private bool pesoLordoFieldSpecified;
    
        private decimal pesoNettoField;
    
        private bool pesoNettoFieldSpecified;
    
        private System.DateTime dataOraRitiroField;
    
        private bool dataOraRitiroFieldSpecified;
    
        private System.DateTime dataInizioTrasportoField;
    
        private bool dataInizioTrasportoFieldSpecified;
    
        private string tipoResaField;
    
        private IndirizzoType indirizzoResaField;
    
        private System.DateTime dataOraConsegnaField;
    
        private bool dataOraConsegnaFieldSpecified;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiAnagraficiVettoreType DatiAnagraficiVettore {
            get {
                return this.datiAnagraficiVettoreField;
            }
            set {
                this.datiAnagraficiVettoreField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string MezzoTrasporto {
            get {
                return this.mezzoTrasportoField;
            }
            set {
                this.mezzoTrasportoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CausaleTrasporto {
            get {
                return this.causaleTrasportoField;
            }
            set {
                this.causaleTrasportoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="integer")]
        public string NumeroColli {
            get {
                return this.numeroColliField;
            }
            set {
                this.numeroColliField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Descrizione {
            get {
                return this.descrizioneField;
            }
            set {
                this.descrizioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string UnitaMisuraPeso {
            get {
                return this.unitaMisuraPesoField;
            }
            set {
                this.unitaMisuraPesoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal PesoLordo {
            get {
                return this.pesoLordoField;
            }
            set {
                this.pesoLordoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool PesoLordoSpecified {
            get {
                return this.pesoLordoFieldSpecified;
            }
            set {
                this.pesoLordoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal PesoNetto {
            get {
                return this.pesoNettoField;
            }
            set {
                this.pesoNettoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool PesoNettoSpecified {
            get {
                return this.pesoNettoFieldSpecified;
            }
            set {
                this.pesoNettoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public System.DateTime DataOraRitiro {
            get {
                return this.dataOraRitiroField;
            }
            set {
                this.dataOraRitiroField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataOraRitiroSpecified {
            get {
                return this.dataOraRitiroFieldSpecified;
            }
            set {
                this.dataOraRitiroFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataInizioTrasporto {
            get {
                return this.dataInizioTrasportoField;
            }
            set {
                this.dataInizioTrasportoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataInizioTrasportoSpecified {
            get {
                return this.dataInizioTrasportoFieldSpecified;
            }
            set {
                this.dataInizioTrasportoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string TipoResa {
            get {
                return this.tipoResaField;
            }
            set {
                this.tipoResaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IndirizzoType IndirizzoResa {
            get {
                return this.indirizzoResaField;
            }
            set {
                this.indirizzoResaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public System.DateTime DataOraConsegna {
            get {
                return this.dataOraConsegnaField;
            }
            set {
                this.dataOraConsegnaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataOraConsegnaSpecified {
            get {
                return this.dataOraConsegnaFieldSpecified;
            }
            set {
                this.dataOraConsegnaFieldSpecified = value;
            }
        }
    }
}