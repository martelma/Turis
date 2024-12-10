using System;
using System.Collections.Generic;

namespace MiBox.Print.Api.Models
{
    public class Cart
    {
        public string CartId { get; set; }
        public string CartBaseCode { get; set; }
        public int CartNumber { get; set; }
        public string CartNumberText { get; set; }
        public int MinSequence { get; set; }
        public string MinSequenceText { get; set; }
        public int MaxSequence { get; set; }
        public string MaxSequenceText { get; set; }
        public string ProcessId { get; set; }
        public string ProcessCode { get; set; }
        public string ProcessName { get; set; }
        public bool Released { get; set; }
        public string WotkstationCode { get; set; }
        public string WotkstationName { get; set; }
        public string WorkPhaseFlowType { get; set; }
        public string UserOpen { get; set; }
        public DateTime TimeStampeOpen { get; set; }
        public string UserClose { get; set; }
        public DateTime TimeStampeClose { get; set; }
        public IEnumerable<CartItem> Details { get; set; }
    }
}