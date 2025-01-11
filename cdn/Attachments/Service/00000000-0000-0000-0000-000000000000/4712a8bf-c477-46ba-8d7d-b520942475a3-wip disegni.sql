DECLARE @DocumentIds NVarChar(MAX)
--SET @DocumentIds = '3312461' --parte
SET @DocumentIds = '3312460' --tavola

--Cosa contiene
;WITH cteIds as
(
	SELECT value as DocumentID 
	  FROM STRING_SPLIT(@DocumentIds, ',')
)
, cteRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteIds
				ON cteIds.DocumentID = UserRevs.DocumentID
)
, cteDocument as 
(
	SELECT DISTINCT ref.DocumentId as DocumentId
		 , ref.RevNr as RevNr
		 , rn.LastRevisionNumber as LastRevNr
		 , drc.ConfigurationID
		 , drc.RevisionNo
		 , ref.XRefID
	  FROM XRefs ref
		INNER JOIN cteRevNb rn
			ON rn.DocumentID = ref.DocumentId
		INNER JOIN DocumentRevisionConfiguration drc
			ON drc.DocumentID = ref.DocumentId
				AND drc.RevisionNo >= ref.RevNr
				AND drc.RevisionNo <= rn.LastRevisionNumber
	 WHERE ref.DocumentId = @DocumentIds
)
--select * from cteDocument
, cteChildren as
(
	SELECT DISTINCT doc.DocumentId as [Key]
		 --, doc.RevNr as KeyRevNr
		 , doc.LastRevNr as KeyLastRevNr
		 , doc.ConfigurationID as KeyConfigurationId
		 , doc.XRefID as KeyXRefID

		 , ref.XRefDocument as DocumentId
		 , ref.RevNr as KeyRevNr
		 , ref.XRefRevNr as ChildRevNr

		 , docRef.ExtensionID
		 , docRef.Filename
		 , refConf.XRefConfigurationID as ConfigurationId
		 , ref.XRefID
	FROM XRefs ref WITH(NOLOCK)

		INNER JOIN DocumentRevisionConfiguration drc WITH(NOLOCK)
			ON drc.DocumentID = ref.XRefDocument
				AND drc.RevisionNo = ref.XRefRevNr

		INNER JOIN cteDocument doc WITH(NOLOCK)
			ON doc.DocumentId = ref.DocumentID
				AND doc.XRefID = ref.XRefID

		INNER JOIN XRefConfiguration refConf WITH(NOLOCK)
			ON refConf.XRefID = doc.XRefID
				AND refConf.XRefConfigurationID = drc.ConfigurationID
				AND refConf.ConfigurationID = doc.ConfigurationID

		INNER JOIN Documents docRef WITH(NOLOCK)
			ON docRef.DocumentID = ref.XRefDocument
				AND docRef.ExtensionID in (3, 4, 5, 19, 49)
				AND docRef.CurrentStatusID IN (14, 104, 565, 559, 179)
				AND docRef.Deleted = 0
				AND docRef.Shared = 1
)
--select * from cteChildren
, cteChildrenXRefIds as
(
	SELECT DISTINCT [Key]
	  FROM cteChildren
)
--select * from cteChildrenXRefIds
, cteKeyRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteChildrenXRefIds
				ON cteChildrenXRefIds.[Key] = UserRevs.DocumentID
)
--select * from cteKeyRevNb
, cteChildrenIds as
(
	SELECT DISTINCT DocumentID
	  FROM cteChildren
)
--select * from cteChildrenIds
, cteChildrenRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteChildrenIds
				ON cteChildrenIds.DocumentID = UserRevs.DocumentID
)
--select * from cteChildrenRevNb
, cte as
(
	SELECT DISTINCT cteChildren.*
		 , rn.RevisionNumber
		 , rn.LastRevisionNumber
		 , rnKey.RevisionNumber as RevisionNumberKey
		 , rnKey.LastRevisionNumber as LastRevisionNumberKey
	  FROM cteChildren
			INNER JOIN cteKeyRevNb rnKey
				ON rnKey.DocumentID = cteChildren.[Key]
			INNER JOIN cteChildrenRevNb rn
				ON rn.DocumentID = cteChildren.DocumentId

	 WHERE KeyRevNr >= rnKey.RevisionNumber and KeyRevNr <= rnKey.LastRevisionNumber
	   AND ChildRevNr >= rn.RevisionNumber and ChildRevNr <= rn.LastRevisionNumber
)
--select * from cte
, cteDrawCodeRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS DrawCode
		 , vv.ConfigurationID
	  FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 153
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteDrawCode AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, DrawCode, ConfigurationID
	  FROM cteDrawCodeRowNun 
	 WHERE RowNun = 1
)
--select * from cteDrawCode
, cteRevLetterRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS RevisionLetter
		 , vv.ConfigurationID
	 FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 51 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteRevLetter AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, RevisionLetter, ConfigurationID
	  FROM cteRevLetterRowNun 
	 WHERE RowNun = 1
	   AND LEN(TRIM(RevisionLetter)) > 0
)
--select * from cteRevLetter
SELECT DISTINCT 'PDM|' + LTRIM(STR(cte.DocumentID)) + '|'  + LTRIM(cteDrawCode.DrawCode) + '|' + cteRevLetter.RevisionLetter  as UniqueSourceKey
	 , cte.[Key]
	 , cte.KeyXRefID
	 , cte.RevisionNumberKey as RevNumKey
	 , cte.LastRevisionNumberKey as LastRevNumKey
	 , cte.KeyConfigurationId
	 , cte.DocumentID as DocumentId
	 , cte.Filename
	 , cte.ExtensionID as [Type]
	 , cte.KeyRevNr
	 , cte.ChildRevNr
	 , cte.RevisionNumber as RevNum
	 , cte.LastRevisionNumber as LastRevNum
	 , cteDrawCode.DrawCode
	 , cteRevLetter.RevisionLetter as Revision
	 , conf.ConfigurationID as ConfId
	 , conf.ConfigurationName as ConfName
	 , cte.XRefID
  FROM cte
	INNER JOIN cteDrawCode
		ON cte.DocumentID = cteDrawCode.DocumentID
			AND cte.RevisionNumber = cteDrawCode.RevisionNumber
	INNER JOIN cteRevLetter
		ON cte.DocumentID = cteRevLetter.DocumentID
			AND cte.RevisionNumber = cteRevLetter.RevisionNumber
			AND cteDrawCode.ConfigurationID = cteRevLetter.ConfigurationID
	
	INNER JOIN DocumentRevisionConfiguration drc WITH(NOLOCK)
		on drc.DocumentID = cte.DocumentID
			and drc.RevisionNo >= cte.RevisionNumber
			and drc.RevisionNo <= cte.LastRevisionNumber
			and drc.ConfigurationID = cteRevLetter.ConfigurationID
	INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
		on drc.ConfigurationID = conf.ConfigurationID

	INNER JOIN XRefConfiguration refConf
		ON refConf.XRefID = cte.KeyXRefID
			AND refConf.ConfigurationID = cte.KeyConfigurationId
			AND refConf.XRefConfigurationID = conf.ConfigurationID

order by cte.LastRevisionNumber