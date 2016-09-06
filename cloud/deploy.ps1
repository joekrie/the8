#Requires -Module AzureRM.Profile
#Requires -Module AzureRM.Resources

$SecureAzureKey = ConvertTo-SecureString $env:AZURE_KEY -AsPlainText -Force
$AzureCreds = New-Object System.Management.Automation.PSCredential ("86ca6e54-2a1f-4d4c-84e6-fbe68e659e82", $SecureAzureKey)
Login-AzureRmAccount -Credential $AzureCreds -ServicePrincipal -TenantId "81dd0ff5-473f-42c0-b5b6-1515970a60b4" -SubscriptionId "777c3a6c-ac90-4291-8628-3df75fe12521"
