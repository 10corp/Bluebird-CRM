<?php /* Smarty version 2.6.26, created on 2010-07-06 10:37:47
         compiled from CRM/common/openFlashChart.tpl */ ?>
<script type="text/javascript" src="<?php echo $this->_tpl_vars['config']->resourceBase; ?>
packages/OpenFlashChart/js/json/json2.js"></script>
<script type="text/javascript" src="<?php echo $this->_tpl_vars['config']->resourceBase; ?>
packages/OpenFlashChart/js/swfobject.js"></script>
<?php echo '
<script type="text/javascript">
    function createSWFObject( chartID, divName, xSize, ySize, loadDataFunction ) {
       var flashFilePath = '; ?>
"<?php echo $this->_tpl_vars['config']->resourceBase; ?>
packages/OpenFlashChart/open-flash-chart.swf"<?php echo ';

       //create object.  	   
       swfobject.embedSWF( flashFilePath, divName,
    		                 xSize, ySize, "9.0.0",
    		                 "expressInstall.swf",
    		                 {"get-data":loadDataFunction, "id":chartID}
    		                );
    }
</script>
'; ?>