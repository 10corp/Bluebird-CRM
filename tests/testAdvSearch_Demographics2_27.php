<?php /* 

    Feb 27, 2012
    This test script uses the Advanced Search
    /Demographics/Gender = Female

    1. open sd99
    2. log in
    3. open advanced search
    4. open Demographics subcategory
    5. run search by Gender=Female

*/

require_once 'PHPUnit/Extensions/SeleniumTestCase.php';
require_once 'SampleGenerator.php';
require_once 'Config.php';


class WebTest extends PHPUnit_Extensions_SeleniumTestCase
{
    protected $captureScreenshotOnFailure = FALSE;
    protected $screenshotPath = getScreenshotPath();
    protected $screenshotUrl = 'http://localhost/screenshots';
 
    protected function setUp()
    {
        $this->settings = new BluebirdSeleniumSettings();
        $this->setBrowser($this->settings->browser);
        $this->setBrowserUrl($this->settings->sandboxURL);

        if (strpos($this->settings->browser,"firefox")) {
            $this->captureScreenshotOnFailure = TRUE;
        }
        //$this->setSleep($this->settings->sleepTime);
    }
 
    public function testTitle()
    {
        $myurl = getMainURL();

        if (strpos($this->settings->browser,"explore")) {
            $myurl.='/logout';                              //IE has problems closing the session
        }

        $this->openAndWait($myurl);
        $this->assertTitle(getMainURLTitle());         // make sure Bluebird is open
        $this->webtestLogin();
        $this->performTasks();
    }

/*
    This function logs in to Bluebird using standard Username and Password
*/
    public function webtestLogin() {
        //$this->open("{$this->sboxPath}user");
        $password = $this->settings->adminPassword;
        $username = $this->settings->adminUsername;
        // Make sure login form is available
        $this->waitForElementPresent('edit-submit');
        $this->type('edit-name', $username);
        $this->type('edit-pass', $password);
        $this->click('edit-submit');
        $this->waitForPageToLoad('30000');
    }

/*
    This function contains call for all other functions
*/
    public function performTasks() {
        $this->setSleep($this->settings->sleepTime);
        $this->openAdvancedSearch();

        $this->click('demographics');
        $this->waitForElementPresent('CIVICRM_QFID_1_2');

        $this->click('CIVICRM_QFID_1_2'); // click on Female

        $this->click('_qf_Advanced_refresh');
        $this->waitForPageToLoad('30000');

        $this->assertTitle('Advanced Search');
        $this->assertTrue($this->isTextPresent("Print"),"Advanced Search: Contacts with Gender=\"Female\" not found in the database ");
    }

    private function openAdvancedSearch() {
        // ADVANCED SEARCH actually is not a link
        // AND its content loads dynamically
        $this->click('class=civi-advanced-search-link');
        $this->waitForElementPresent('_qf_Advanced_refresh');

    }

    private function stop() {
        $this->waitForElementPresent('NonExistentElement');
    }


}
?>