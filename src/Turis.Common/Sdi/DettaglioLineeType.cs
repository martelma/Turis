using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace = "http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DettaglioLineeType
    {

        private string numeroLineaField;

        private TipoCessionePrestazioneType tipoCessionePrestazioneField;

        private bool tipoCessionePrestazioneFieldSpecified;

        private CodiceArticoloType[] codiceArticoloField;

        private string descrizioneField;

        private string quantitaField;

        private bool quantitaFieldSpecified;

        private string unitaMisuraField;

        private System.DateTime dataInizioPeriodoField;

        private bool dataInizioPeriodoFieldSpecified;

        private System.DateTime dataFinePeriodoField;

        private bool dataFinePeriodoFieldSpecified;

        private decimal prezzoUnitarioField;

        private ScontoMaggiorazioneType[] scontoMaggiorazioneField;

        private decimal prezzoTotaleField;

        private decimal aliquotaIVAField;

        private RitenutaType ritenutaField;

        private bool ritenutaFieldSpecified;

        private NaturaType naturaField;

        private bool naturaFieldSpecified;

        private string riferimentoAmministrazioneField;

        private AltriDatiGestionaliType[] altriDatiGestionaliField;

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "integer")]
        public string NumeroLinea
        {
            get
            {
                return this.numeroLineaField;
            }
            set
            {
                this.numeroLineaField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public TipoCessionePrestazioneType TipoCessionePrestazione
        {
            get
            {
                return this.tipoCessionePrestazioneField;
            }
            set
            {
                this.tipoCessionePrestazioneField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool TipoCessionePrestazioneSpecified
        {
            get
            {
                return this.tipoCessionePrestazioneFieldSpecified;
            }
            set
            {
                this.tipoCessionePrestazioneFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("CodiceArticolo", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public CodiceArticoloType[] CodiceArticolo
        {
            get
            {
                return this.codiceArticoloField;
            }
            set
            {
                this.codiceArticoloField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "normalizedString")]
        public string Descrizione
        {
            get
            {
                return this.descrizioneField;
            }
            set
            {
                this.descrizioneField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Quantita
        {
            get
            {
                return this.quantitaField;
            }
            set
            {
                this.quantitaField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool QuantitaSpecified
        {
            get
            {
                return this.quantitaFieldSpecified;
            }
            set
            {
                this.quantitaFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "normalizedString")]
        public string UnitaMisura
        {
            get
            {
                return this.unitaMisuraField;
            }
            set
            {
                this.unitaMisuraField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "date")]
        public System.DateTime DataInizioPeriodo
        {
            get
            {
                return this.dataInizioPeriodoField;
            }
            set
            {
                this.dataInizioPeriodoField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataInizioPeriodoSpecified
        {
            get
            {
                return this.dataInizioPeriodoFieldSpecified;
            }
            set
            {
                this.dataInizioPeriodoFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "date")]
        public System.DateTime DataFinePeriodo
        {
            get
            {
                return this.dataFinePeriodoField;
            }
            set
            {
                this.dataFinePeriodoField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataFinePeriodoSpecified
        {
            get
            {
                return this.dataFinePeriodoFieldSpecified;
            }
            set
            {
                this.dataFinePeriodoFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal PrezzoUnitario
        {
            get
            {
                return this.prezzoUnitarioField;
            }
            set
            {
                this.prezzoUnitarioField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("ScontoMaggiorazione", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public ScontoMaggiorazioneType[] ScontoMaggiorazione
        {
            get
            {
                return this.scontoMaggiorazioneField;
            }
            set
            {
                this.scontoMaggiorazioneField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal PrezzoTotale
        {
            get
            {
                return this.prezzoTotaleField;
            }
            set
            {
                this.prezzoTotaleField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal AliquotaIVA
        {
            get
            {
                return this.aliquotaIVAField;
            }
            set
            {
                this.aliquotaIVAField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public RitenutaType Ritenuta
        {
            get
            {
                return this.ritenutaField;
            }
            set
            {
                this.ritenutaField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool RitenutaSpecified
        {
            get
            {
                return this.ritenutaFieldSpecified;
            }
            set
            {
                this.ritenutaFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public NaturaType Natura
        {
            get
            {
                return this.naturaField;
            }
            set
            {
                this.naturaField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool NaturaSpecified
        {
            get
            {
                return this.naturaFieldSpecified;
            }
            set
            {
                this.naturaFieldSpecified = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form = System.Xml.Schema.XmlSchemaForm.Unqualified, DataType = "normalizedString")]
        public string RiferimentoAmministrazione
        {
            get
            {
                return this.riferimentoAmministrazioneField;
            }
            set
            {
                this.riferimentoAmministrazioneField = value;
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("AltriDatiGestionali", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public AltriDatiGestionaliType[] AltriDatiGestionali
        {
            get
            {
                return this.altriDatiGestionaliField;
            }
            set
            {
                this.altriDatiGestionaliField = value;
            }
        }
    }
}